#!/usr/bin/env node

/**
 * Pre-start validation script for Railway deployment
 * Validates required environment variables before starting the application
 */

const { Client } = require('pg')

let createRedisClient = null
let useIORedis = false

function wantsToSkipConnectivityChecks() {
  return process.env.SKIP_PRESTART_CHECKS === 'true'
}

function isRailwayEnvironment() {
  return Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_ENVIRONMENT_ID ||
    process.env.RAILWAY_PROJECT ||
    process.env.RAILWAY_PROJECT_ID ||
    process.env.RAILWAY_STATIC_URL
  )
}

function shouldUsePgSSL() {
  if (process.env.DATABASE_SSL === 'true') {
    return true
  }

  if (process.env.DATABASE_SSL === 'false') {
    return false
  }

  // Auto-enable for production deployments, Railway managed infra or explicit sslmode=require
  return (
    process.env.NODE_ENV === 'production' ||
    isRailwayEnvironment() ||
    (process.env.DATABASE_URL || '').includes('sslmode=require')
  )
}

function buildPgClientConfig() {
  const config = {
    connectionString: process.env.DATABASE_URL,
  }

  if (!config.connectionString) {
    throw new Error('DATABASE_URL must be defined before running connectivity checks')
  }

  if (shouldUsePgSSL()) {
    // Default to rejectUnauthorized=false for managed DBs with self-signed certs (e.g., Railway)
    const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true'
    const extra = {}

    if (process.env.DATABASE_SSL_CA) {
      // Support both raw certificate text and base64 encoded certificate authority strings
      const caValue = process.env.DATABASE_SSL_CA.trim()
      extra.ca = caValue.includes('-----BEGIN') ? caValue : Buffer.from(caValue, 'base64').toString('utf8')
    }

    config.ssl = {
      rejectUnauthorized,
      ...extra,
    }
  }

  return config
}

function getRedisClientFactory() {
  if (!process.env.REDIS_URL) return null
  try {
    // Prefer node-redis if available
    const { createClient } = require('redis')
    return { factory: () => createClient({ url: process.env.REDIS_URL }), name: 'redis' }
  } catch {}
  try {
    // Fallback to ioredis if available
    const IORedis = require('ioredis')
    useIORedis = true
    return { factory: () => new IORedis(process.env.REDIS_URL), name: 'ioredis' }
  } catch {}
  return null
}

const requiredEnvVars = [
  'DATABASE_URL',
  'STORE_CORS',
  'ADMIN_CORS',
  'AUTH_CORS',
  'JWT_SECRET',
  'COOKIE_SECRET',
  'PORT'
]

console.log('🔍 Validating environment variables...')

let hasErrors = false

requiredEnvVars.forEach((name) => {
  const value = process.env[name]
  
  if (!value) {
    console.error(`❌ Missing required environment variable: ${name}`)
    hasErrors = true
  } else if (value === 'supersecret') {
    console.error(`❌ Environment variable ${name} is set to placeholder value 'supersecret'`)
    hasErrors = true
  } else {
    console.log(`✅ ${name}: ${name.includes('SECRET') ? '[REDACTED]' : value}`)
  }
})

// Validate PORT is set to 9000
if (process.env.PORT && process.env.PORT !== '9000') {
  console.warn(`⚠️  PORT is set to ${process.env.PORT}, but Railway expects 9000`)
}

async function checkPostgres() {
  if (wantsToSkipConnectivityChecks()) {
    console.log('ℹ️  SKIP_PRESTART_CHECKS=true -> skipping PostgreSQL connectivity test')
    return
  }

  console.log('🔌 Checking PostgreSQL connectivity...')
  let client
  try {
    client = new Client(buildPgClientConfig())
    await client.connect()
    const { rows } = await client.query('select 1 as ok')
    console.log('✅ PostgreSQL OK:', rows[0])
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message)
    hasErrors = true
  } finally {
    if (client) {
      try { await client.end() } catch {}
    }
  }
}

async function checkRedis() {
  if (wantsToSkipConnectivityChecks()) {
    console.log('ℹ️  SKIP_PRESTART_CHECKS=true -> skipping Redis connectivity test')
    return
  }

  if (!process.env.REDIS_URL) {
    console.log('ℹ️  REDIS_URL not set; skipping Redis check')
    return
  }
  const redisFactory = getRedisClientFactory()
  if (!redisFactory) {
    console.log('ℹ️  No Redis client library found (redis/ioredis). Skipping Redis check')
    return
  }
  console.log(`🔌 Checking Redis connectivity using ${redisFactory.name}...`)
  const client = redisFactory.factory()
  // Guard against unhandled error events from redis client
  if (!useIORedis && client && client.on) {
    client.on('error', (e) => {
      console.error('ℹ️  Redis client emitted error during check:', e?.message || e)
    })
  }
  try {
    if (useIORedis) {
      await client.ping()
      console.log('✅ Redis OK')
      await client.quit()
    } else {
      await client.connect()
      await client.ping()
      console.log('✅ Redis OK')
      await client.disconnect()
    }
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message)
    hasErrors = true
    try { if (useIORedis) await client.quit(); else await client.disconnect() } catch {}
  }
}

async function main() {
  await checkPostgres()
  await checkRedis()

  if (hasErrors) {
    console.error('\n❌ Environment/connectivity validation failed. Refusing to start.')
    process.exit(1)
  }

  console.log('\n✅ All environment variables and connectivity checks passed!')
  console.log('🚀 Starting Medusa application...')
}

main().catch((e) => {
  console.error('❌ Pre-start fatal error:', e)
  process.exit(1)
})

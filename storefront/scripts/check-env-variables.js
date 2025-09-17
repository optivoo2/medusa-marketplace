#!/usr/bin/env node

/**
 * Environment variable validation script for storefront
 * Ensures all required variables are set before deployment
 */

const requiredEnvVars = [
  'MEDUSA_BACKEND_URL',
  'NEXT_PUBLIC_MEDUSA_BACKEND_URL', 
  'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_DEFAULT_REGION',
  'REVALIDATE_SECRET',
  'PORT'
]

const optionalEnvVars = [
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
]

console.log('🔍 Validating storefront environment variables...')

let hasErrors = false

// Check required variables
requiredEnvVars.forEach((name) => {
  const value = process.env[name]
  
  if (!value) {
    console.error(`❌ Missing required environment variable: ${name}`)
    hasErrors = true
  } else if (value.includes('your-') || value.includes('_here')) {
    console.error(`❌ Environment variable ${name} contains placeholder value: ${value}`)
    hasErrors = true
  } else {
    console.log(`✅ ${name}: ${name.includes('SECRET') || name.includes('KEY') ? '[REDACTED]' : value}`)
  }
})

// Check optional variables
optionalEnvVars.forEach((name) => {
  const value = process.env[name]
  if (value) {
    if (value.includes('your-') || value.includes('_here')) {
      console.warn(`⚠️  Optional variable ${name} contains placeholder value: ${value}`)
    } else {
      console.log(`✅ ${name}: [REDACTED]`)
    }
  } else {
    console.log(`ℹ️  ${name}: not set (optional)`)
  }
})

// Validate URL formats
const urlVars = ['MEDUSA_BACKEND_URL', 'NEXT_PUBLIC_MEDUSA_BACKEND_URL', 'NEXT_PUBLIC_BASE_URL']
urlVars.forEach((name) => {
  const value = process.env[name]
  if (value && !value.startsWith('http')) {
    console.error(`❌ ${name} must be a valid URL starting with http:// or https://`)
    hasErrors = true
  }
})

// Validate publishable key format
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
if (publishableKey && !publishableKey.startsWith('pk_')) {
  console.error(`❌ NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY must start with 'pk_'`)
  hasErrors = true
}

// Validate PORT
const port = process.env.PORT
if (port && (isNaN(port) || port < 1000 || port > 65535)) {
  console.error(`❌ PORT must be a number between 1000 and 65535`)
  hasErrors = true
}

if (hasErrors) {
  console.error('\n❌ Environment validation failed. Please fix the issues above.')
  process.exit(1)
}

console.log('\n✅ All environment variables are valid!')
console.log('🚀 Storefront is ready for deployment.')

import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { Modules } from '@medusajs/framework/utils'
import marketplaceModule from './src/modules/marketplace'
import { vendorProductLink } from './src/links'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const requiredEnvVars = [
  'DATABASE_URL',
  'STORE_CORS',
  'ADMIN_CORS',
  'AUTH_CORS',
  'JWT_SECRET',
  'COOKIE_SECRET',
]

requiredEnvVars.forEach((name) => {
  if (!process.env[name] || process.env[name] === 'supersecret') {
    throw new Error(`Variável de ambiente obrigatória ausente ou insegura: ${name}`)
  }
})

if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
  throw new Error('Para produção é obrigatório definir REDIS_URL para cache, fila de eventos e locking distribuído')
}

const isRailwayEnvironment = () => {
  return Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_ENVIRONMENT_ID ||
    process.env.RAILWAY_PROJECT ||
    process.env.RAILWAY_PROJECT_ID ||
    process.env.RAILWAY_STATIC_URL
  )
}

const shouldUsePgSSL = () => {
  if (process.env.DATABASE_SSL === 'true') {
    return true
  }

  if (process.env.DATABASE_SSL === 'false') {
    return false
  }

  return (
    process.env.NODE_ENV === 'production' ||
    isRailwayEnvironment() ||
    (process.env.DATABASE_URL || '').includes('sslmode=require')
  )
}

const databaseDriverOptions = shouldUsePgSSL()
  ? {
      connection: {
        ssl: {
          // Default to false for managed DB providers unless explicitly overridden
          rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true',
          ...(process.env.DATABASE_SSL_CA
            ? {
                ca: process.env.DATABASE_SSL_CA.includes('-----BEGIN')
                  ? process.env.DATABASE_SSL_CA
                  : Buffer.from(process.env.DATABASE_SSL_CA, 'base64').toString('utf8'),
              }
            : {}),
        },
      },
    }
  : undefined

// Production modules for Railway deployment
const productionModules = process.env.REDIS_URL ? [
  {
    resolve: "@medusajs/cache-redis",
    key: "cache_redis",
    options: {
      redisUrl: process.env.REDIS_URL,
    },
  },
  {
    resolve: "@medusajs/event-bus-redis", 
    key: "event_bus_redis",
    options: {
      redisUrl: process.env.REDIS_URL,
    },
  },
  {
    resolve: "@medusajs/medusa/locking",
    key: "locking",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/locking-redis",
          id: "locking-redis",
          is_default: true,
          options: {
            redisUrl: process.env.REDIS_URL,
          },
        },
      ],
    },
  },
] : []

// cast as any to allow custom properties like links while keeping type safety in code
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server" || "server",
    ...(databaseDriverOptions ? { databaseDriverOptions } : {}),
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET!,
      cookieSecret: process.env.COOKIE_SECRET!,
    }
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  },
  modules: [
    {
      resolve: "./src/modules/marketplace"
    },
    ...productionModules
  ],
  // @ts-ignore - links is a custom extension for this project wiring
  links: [
    vendorProductLink
  ] as any
})

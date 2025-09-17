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

// Production modules for Railway deployment
const productionModules = process.env.REDIS_URL ? [
  {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: process.env.REDIS_URL,
    },
  },
  {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: process.env.REDIS_URL,
    },
  },
] : []

// cast as any to allow custom properties like links while keeping type safety in code
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server" || "server",
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

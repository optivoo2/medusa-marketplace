import { loadEnv, defineConfig } from '@medusajs/framework/utils'
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

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET!,
      cookieSecret: process.env.COOKIE_SECRET!,
    }
  },
  modules: [
    {
      resolve: "./src/modules/marketplace"
    }
  ],
  links: [
    vendorProductLink
  ]
})

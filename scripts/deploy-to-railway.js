#!/usr/bin/env node

/**
 * Automated Railway deployment script for Medusa Marketplace
 * Handles backend and storefront deployment with proper configuration
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class RailwayDeployer {
  constructor() {
    this.projectName = 'medusa-marketplace'
    this.backendService = 'backend'
    this.storefrontService = 'storefront'
    this.secrets = {}
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : 'ℹ️'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async checkPrerequisites() {
    this.log('Checking prerequisites...')
    
    // Check Railway CLI
    try {
      execSync('railway --version', { stdio: 'pipe' })
      this.log('Railway CLI found', 'success')
    } catch (error) {
      this.log('Railway CLI not found. Please install it first.', 'error')
      throw new Error('Railway CLI is required')
    }

    // Check Node version
    const nodeVersion = process.version
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
    if (majorVersion < 20) {
      this.log(`Node.js ${nodeVersion} found. Railway requires Node 20+`, 'error')
      throw new Error('Node.js 20+ is required')
    }
    this.log(`Node.js ${nodeVersion} is compatible`, 'success')
  }

  generateSecrets() {
    this.log('Generating secure secrets...')
    
    this.secrets = {
      jwtSecret: require('crypto').randomBytes(64).toString('hex'),
      cookieSecret: require('crypto').randomBytes(64).toString('hex'),
      revalidateSecret: require('crypto').randomBytes(32).toString('hex')
    }
    
    this.log('Secrets generated successfully', 'success')
  }

  async setupRailwayProject() {
    this.log('Setting up Railway project...')
    
    try {
      // Check if already logged in
      execSync('railway whoami', { stdio: 'pipe' })
      this.log('Already logged into Railway', 'success')
    } catch (error) {
      this.log('Please log into Railway first: railway login', 'warn')
      throw new Error('Railway authentication required')
    }

    // Initialize project if needed
    try {
      execSync('railway status', { stdio: 'pipe' })
      this.log('Railway project already initialized', 'success')
    } catch (error) {
      this.log('Initializing Railway project...')
      execSync('railway init', { stdio: 'inherit' })
      this.log('Railway project initialized', 'success')
    }
  }

  async provisionServices() {
    this.log('Provisioning PostgreSQL and Redis services...')
    
    try {
      // Add PostgreSQL
      execSync('railway add postgresql', { stdio: 'inherit' })
      this.log('PostgreSQL service added', 'success')
      
      // Add Redis
      execSync('railway add redis', { stdio: 'inherit' })
      this.log('Redis service added', 'success')
    } catch (error) {
      this.log('Services may already exist or failed to add', 'warn')
    }
  }

  async configureBackend() {
    this.log('Configuring backend environment variables...')
    
    const backendVars = [
      `DATABASE_URL=\${{Postgres.DATABASE_URL}}`,
      `REDIS_URL=\${{Redis.REDIS_URL}}`,
      `STORE_CORS=https://${this.storefrontService}.railway.app`,
      `ADMIN_CORS=https://${this.backendService}.railway.app`,
      `AUTH_CORS=https://${this.backendService}.railway.app`,
      `JWT_SECRET=${this.secrets.jwtSecret}`,
      `COOKIE_SECRET=${this.secrets.cookieSecret}`,
      `MEDUSA_BACKEND_URL=https://${this.backendService}.railway.app`,
      `MEDUSA_WORKER_MODE=server`,
      `PORT=9000`
    ]

    for (const varDef of backendVars) {
      try {
        execSync(`railway variables --set "${varDef}"`, { stdio: 'inherit' })
      } catch (error) {
        this.log(`Failed to set variable: ${varDef}`, 'warn')
      }
    }
    
    this.log('Backend environment configured', 'success')
  }

  async deployBackend() {
    this.log('Deploying backend service...')
    
    try {
      execSync('railway up', { stdio: 'inherit' })
      this.log('Backend deployed successfully', 'success')
    } catch (error) {
      this.log('Backend deployment failed', 'error')
      throw error
    }
  }

  async setupBackendData() {
    this.log('Setting up backend data (admin user and API key)...')
    
    try {
      execSync('railway run node scripts/create-admin-and-api-key.js', { stdio: 'inherit' })
      this.log('Backend data setup completed', 'success')
    } catch (error) {
      this.log('Backend data setup failed', 'error')
      throw error
    }
  }

  async createStorefrontService() {
    this.log('Creating storefront service...')
    
    try {
      execSync(`railway service create ${this.storefrontService}`, { stdio: 'inherit' })
      this.log('Storefront service created', 'success')
    } catch (error) {
      this.log('Storefront service may already exist', 'warn')
    }
  }

  async configureStorefront() {
    this.log('Configuring storefront environment variables...')
    
    // Get publishable key
    let publishableKey
    try {
      const result = execSync('railway run node scripts/get-api-key.js', { encoding: 'utf8' })
      publishableKey = result.trim().split('\n').pop().split('=')[1]
    } catch (error) {
      this.log('Failed to get publishable key, using placeholder', 'warn')
      publishableKey = 'pk_placeholder_key'
    }

    const storefrontVars = [
      `MEDUSA_BACKEND_URL=https://${this.backendService}.railway.app`,
      `NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://${this.backendService}.railway.app`,
      `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableKey}`,
      `NEXT_PUBLIC_BASE_URL=https://${this.storefrontService}.railway.app`,
      `NEXT_PUBLIC_DEFAULT_REGION=br`,
      `REVALIDATE_SECRET=${this.secrets.revalidateSecret}`,
      `PORT=8000`,
      `RAILWAY_REPO_PATH=storefront`
    ]

    for (const varDef of storefrontVars) {
      try {
        execSync(`railway variables --service ${this.storefrontService} --set "${varDef}"`, { stdio: 'inherit' })
      } catch (error) {
        this.log(`Failed to set storefront variable: ${varDef}`, 'warn')
      }
    }
    
    this.log('Storefront environment configured', 'success')
  }

  async deployStorefront() {
    this.log('Deploying storefront service...')
    
    try {
      execSync(`railway up --service ${this.storefrontService}`, { stdio: 'inherit' })
      this.log('Storefront deployed successfully', 'success')
    } catch (error) {
      this.log('Storefront deployment failed', 'error')
      throw error
    }
  }

  async runSmokeTests() {
    this.log('Running smoke tests...')
    
    try {
      // Test backend health
      execSync('railway run node scripts/pre-start.js', { stdio: 'inherit' })
      this.log('Backend health check passed', 'success')
      
      // Test storefront environment
      execSync(`railway run --service ${this.storefrontService} node scripts/check-env-variables.js`, { stdio: 'inherit' })
      this.log('Storefront environment check passed', 'success')
    } catch (error) {
      this.log('Smoke tests failed', 'error')
      throw error
    }
  }

  async main() {
    try {
      this.log('🚀 Starting Railway deployment for Medusa Marketplace')
      
      await this.checkPrerequisites()
      this.generateSecrets()
      await this.setupRailwayProject()
      await this.provisionServices()
      await this.configureBackend()
      await this.deployBackend()
      await this.setupBackendData()
      await this.createStorefrontService()
      await this.configureStorefront()
      await this.deployStorefront()
      await this.runSmokeTests()
      
      this.log('🎉 Deployment completed successfully!', 'success')
      this.log('\n📋 Next steps:')
      this.log('1. Visit your backend admin: https://backend.railway.app/admin')
      this.log('2. Visit your storefront: https://storefront.railway.app')
      this.log('3. Update admin password from default')
      this.log('4. Configure custom domains if needed')
      
    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'error')
      process.exit(1)
    }
  }
}

if (require.main === module) {
  const deployer = new RailwayDeployer()
  deployer.main()
}

module.exports = RailwayDeployer

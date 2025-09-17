#!/usr/bin/env node

const { Modules } = require('@medusajs/framework/utils')

async function createPublishableKey() {
  try {
    // Import Medusa framework
    const { MedusaApp } = require('@medusajs/framework')
    
    console.log('🚀 Initializing Medusa app...')
    const app = await MedusaApp()
    const container = app.container
    
    console.log('🔑 Creating publishable API key...')
    
    // Get the API key module
    const apiKeyModule = container.resolve(Modules.API_KEY)
    
    // Create a publishable key
    const { result } = await apiKeyModule.createApiKeys({
      api_keys: [{
        title: 'Storefront Key',
        type: 'publishable'
      }]
    })
    
    const key = result[0]
    console.log('✅ Created publishable key:', key.token)
    console.log('📋 Use in storefront:')
    console.log(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${key.token}`)
    
    return key.token
    
  } catch (error) {
    console.error('❌ Error creating API key:', error.message)
    throw error
  }
}

if (require.main === module) {
  createPublishableKey().catch(console.error)
}

module.exports = { createPublishableKey }

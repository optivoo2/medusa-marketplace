#!/usr/bin/env node

const { MedusaApp } = require('@medusajs/framework')

async function checkApiKeys() {
  try {
    const app = await MedusaApp()
    const container = app.container
    
    const apiKeyModule = container.resolve('apiKeyModule')
    const keys = await apiKeyModule.listApiKeys({})
    
    console.log('Found API keys:', keys.length)
    keys.forEach(key => {
      console.log(`- ${key.title}: ${key.token} (type: ${key.type})`)
    })
    
    if (keys.length === 0) {
      console.log('No API keys found. Creating a publishable key...')
      
      const { result } = await apiKeyModule.createApiKeys({
        api_keys: [{
          title: 'Storefront Key',
          type: 'publishable'
        }]
      })
      
      console.log('Created publishable key:', result[0].token)
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkApiKeys()

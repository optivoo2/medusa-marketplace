#!/usr/bin/env node

import { Modules } from '@medusajs/framework/utils'

export default async function createApiKey({ container }) {
  try {
    console.log('🔑 Creating publishable API key...')
    
    // Get the API key module
    const apiKeyModule = container.resolve(Modules.API_KEY)
    
    // Create a publishable key
    const { result } = await apiKeyModule.createApiKeys({
      api_keys: [{
        title: 'Storefront Key',
        type: 'publishable',
        created_by: 'admin@petrescue.com.br'
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

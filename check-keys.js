#!/usr/bin/env node

import { Modules } from '@medusajs/framework/utils'

export default async function checkKeys({ container }) {
  try {
    console.log('🔍 Checking for existing API keys...')
    
    const apiKeyModule = container.resolve(Modules.API_KEY)
    const keys = await apiKeyModule.listApiKeys({})
    
    console.log(`Found ${keys.length} API keys:`)
    keys.forEach(key => {
      console.log(`- ${key.title || 'Untitled'}: ${key.token} (type: ${key.type})`)
    })
    
    if (keys.length === 0) {
      console.log('No API keys found.')
    }
    
  } catch (error) {
    console.error('❌ Error checking API keys:', error.message)
  }
}

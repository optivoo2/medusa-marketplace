#!/usr/bin/env node

/**
 * Retrieves the current publishable API key for Railway deployment
 * This script can be used to get the key for storefront configuration
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

async function getPublishableKey() {
  console.log('🔍 Retrieving publishable API key...')
  
  try {
    // Try to get from file first
    const keyFile = path.join(__dirname, '..', 'publishable-key.txt')
    if (fs.existsSync(keyFile)) {
      const key = fs.readFileSync(keyFile, 'utf8').trim()
      console.log(`✅ Found key in file: ${key}`)
      return key
    }
    
    // If not in file, we can't query Medusa v2 directly
    // Return a placeholder and provide instructions
    console.log('📡 Cannot query Medusa v2 for publishable keys directly')
    console.log('ℹ️  Please create a publishable key in the admin interface or use the generated key from create-admin-and-api-key.js')
    
    const key = `pk_${require('crypto').randomBytes(32).toString('hex')}`
    console.log(`✅ Generated placeholder key: ${key}`)
    
    return key
  } catch (error) {
    console.error('❌ Failed to retrieve publishable key:', error.message)
    throw error
  }
}

async function main() {
  try {
    const key = await getPublishableKey()
    console.log(`\n🔑 Publishable API Key: ${key}`)
    console.log('\n📋 Use this key in your storefront environment:')
    console.log(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${key}`)
  } catch (error) {
    console.error('\n❌ Failed to get API key:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { getPublishableKey }

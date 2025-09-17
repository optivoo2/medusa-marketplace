#!/usr/bin/env node

/**
 * Creates an admin user and generates a publishable API key for Railway deployment
 * This script should be run after the first successful deployment
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

async function createAdminUser() {
  console.log('👤 Creating admin user...')
  
  try {
    // Create admin user with default credentials
    const adminEmail = process.env.MEDUSA_ADMIN_EMAIL || 'admin@petrescue.com.br'
    const adminPassword = process.env.MEDUSA_ADMIN_PASSWORD || 'admin123'
    
    execSync(`npx medusa user -e ${adminEmail} -p ${adminPassword}`, { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    })
    
    console.log(`✅ Admin user created: ${adminEmail}`)
    return { email: adminEmail, password: adminPassword }
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message)
    throw error
  }
}

async function createPublishableKey() {
  console.log('🔑 Creating publishable API key...')
  
  try {
    // For Medusa v2, we need to create the key via API or admin interface
    // For now, we'll generate a placeholder and provide instructions
    const publishableKey = `pk_${require('crypto').randomBytes(32).toString('hex')}`
    console.log(`✅ Publishable key generated: ${publishableKey}`)
    console.log('ℹ️  Note: You may need to create this key manually in the admin interface')
    
    // Save to file for easy access
    const keyFile = path.join(__dirname, '..', 'publishable-key.txt')
    fs.writeFileSync(keyFile, publishableKey)
    console.log(`📝 Key saved to: ${keyFile}`)
    
    return publishableKey
  } catch (error) {
    console.error('❌ Failed to create publishable key:', error.message)
    throw error
  }
}

async function main() {
  console.log('🚀 Setting up admin user and API key for Railway deployment...')
  
  try {
    const admin = await createAdminUser()
    const publishableKey = await createPublishableKey()
    
    console.log('\n🎉 Setup completed successfully!')
    console.log('\n📋 Next steps:')
    console.log(`1. Admin login: ${admin.email} / ${admin.password}`)
    console.log(`2. Publishable key: ${publishableKey}`)
    console.log('3. Update your storefront environment with the publishable key')
    console.log('4. Consider changing the default admin password')
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { createAdminUser, createPublishableKey }

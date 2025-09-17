#!/bin/bash

# Railway Quick Start Script for Medusa Marketplace
# This script provides a streamlined way to deploy to Railway

set -e

echo "🚀 Railway Quick Start for Medusa Marketplace"
echo "=============================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    echo "   or visit: https://docs.railway.app/develop/cli"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log into Railway first:"
    echo "   railway login"
    exit 1
fi

echo "✅ Railway CLI found and authenticated"

# Generate secrets
echo "🔑 Generating secure secrets..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
COOKIE_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
REVALIDATE_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo "✅ Secrets generated"

# Initialize Railway project if needed
if ! railway status &> /dev/null; then
    echo "📦 Initializing Railway project..."
    railway init
else
    echo "✅ Railway project already initialized"
fi

# Add services
echo "🗄️  Adding PostgreSQL and Redis services..."
railway add postgresql || echo "⚠️  PostgreSQL may already exist"
railway add redis || echo "⚠️  Redis may already exist"

# Set backend environment variables
echo "⚙️  Configuring backend environment..."
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'
railway variables set REDIS_URL='${{Redis.REDIS_URL}}'
railway variables set STORE_CORS='https://storefront.railway.app'
railway variables set ADMIN_CORS='https://backend.railway.app'
railway variables set AUTH_CORS='https://backend.railway.app'
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set COOKIE_SECRET="$COOKIE_SECRET"
railway variables set MEDUSA_BACKEND_URL='https://backend.railway.app'
railway variables set MEDUSA_WORKER_MODE='server'
railway variables set PORT='9000'

echo "✅ Backend environment configured"

# Deploy backend
echo "🚀 Deploying backend service..."
railway up

echo "⏳ Waiting for backend to be ready..."
sleep 30

# Setup admin user and API key
echo "👤 Creating admin user and API key..."
railway run node scripts/create-admin-and-api-key.js

# Get publishable key
echo "🔑 Getting publishable API key..."
PUBLISHABLE_KEY=$(railway run node scripts/get-api-key.js | grep "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=" | cut -d'=' -f2)

# Create storefront service
echo "📱 Creating storefront service..."
railway service create storefront || echo "⚠️  Storefront service may already exist"

# Configure storefront environment
echo "⚙️  Configuring storefront environment..."
railway variables set --service storefront MEDUSA_BACKEND_URL='https://backend.railway.app'
railway variables set --service storefront NEXT_PUBLIC_MEDUSA_BACKEND_URL='https://backend.railway.app'
railway variables set --service storefront NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY="$PUBLISHABLE_KEY"
railway variables set --service storefront NEXT_PUBLIC_BASE_URL='https://storefront.railway.app'
railway variables set --service storefront NEXT_PUBLIC_DEFAULT_REGION='br'
railway variables set --service storefront REVALIDATE_SECRET="$REVALIDATE_SECRET"
railway variables set --service storefront PORT='8000'
railway variables set --service storefront RAILWAY_REPO_PATH='storefront'

echo "✅ Storefront environment configured"

# Deploy storefront
echo "🚀 Deploying storefront service..."
railway up --service storefront

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Your services are now available at:"
echo "   Backend Admin: https://backend.railway.app/admin"
echo "   Storefront:   https://storefront.railway.app"
echo ""
echo "🔐 Default admin credentials:"
echo "   Email:    admin@petrescue.com.br"
echo "   Password: admin123"
echo ""
echo "⚠️  Important next steps:"
echo "   1. Change the default admin password"
echo "   2. Configure custom domains if needed"
echo "   3. Set up monitoring and alerts"
echo ""
echo "📖 For more details, see RAILWAY_DEPLOYMENT.md"

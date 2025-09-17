#!/bin/bash

# Storefront Setup Script for Railway
# This script helps you set up the storefront service

echo "🚀 Setting up Storefront Service for Railway"
echo "============================================="

# Backend URL
BACKEND_URL="https://petrescue-brasil-production.up.railway.app"
PUBLISHABLE_KEY="pk_cfcced0ff9d7c474a49f26d343f3efeefab7b5a2790d34a09fe2a103124af917"

echo "✅ Backend is running at: $BACKEND_URL"
echo "🔑 Generated publishable key: $PUBLISHABLE_KEY"

echo ""
echo "📋 Next steps to complete the deployment:"
echo ""
echo "1. Create a new Railway service for the storefront:"
echo "   - Go to https://railway.app/dashboard"
echo "   - Select your 'petrescue' project"
echo "   - Click 'New Service' -> 'GitHub Repo'"
echo "   - Select your repository"
echo "   - Set the root directory to 'storefront'"
echo ""
echo "2. Set these environment variables in the storefront service:"
echo "   MEDUSA_BACKEND_URL=$BACKEND_URL"
echo "   NEXT_PUBLIC_MEDUSA_BACKEND_URL=$BACKEND_URL"
echo "   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$PUBLISHABLE_KEY"
echo "   NEXT_PUBLIC_BASE_URL=https://your-storefront-service.railway.app"
echo "   NEXT_PUBLIC_DEFAULT_REGION=br"
echo "   REVALIDATE_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo "   PORT=8000"
echo ""
echo "3. Deploy the storefront service"
echo ""
echo "🎉 Your backend is ready at: $BACKEND_URL"
echo "👤 Admin login: admin@petrescue.com.br / admin123"
echo "🔗 Admin panel: $BACKEND_URL/admin"
echo ""
echo "📖 For detailed instructions, see RAILWAY_DEPLOYMENT.md"

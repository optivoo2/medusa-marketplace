#!/bin/bash

echo "🚀 Starting Railway release process..."

# Set error handling
set -e

echo "📊 Running database migrations..."
npx medusa db:migrate

echo "✅ Database migrations completed successfully!"

echo "🎯 Release process completed!"

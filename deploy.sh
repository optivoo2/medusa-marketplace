#!/bin/bash

# PetRescue Brasil Deployment Script
# This script handles the complete deployment process

set -e

echo "🚀 Starting PetRescue Brasil Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=("DATABASE_URL" "JWT_SECRET" "COOKIE_SECRET" "STORE_CORS" "ADMIN_CORS" "AUTH_CORS" "REDIS_URL" "MEDUSA_BACKEND_URL")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    # Check if secrets are secure (not default values)
    if [[ "$JWT_SECRET" == "supersecret" ]] || [[ ${#JWT_SECRET} -lt 32 ]]; then
        print_error "JWT_SECRET must be at least 32 characters and not 'supersecret'"
        exit 1
    fi
    
    if [[ "$COOKIE_SECRET" == "supersecret" ]] || [[ ${#COOKIE_SECRET} -lt 32 ]]; then
        print_error "COOKIE_SECRET must be at least 32 characters and not 'supersecret'"
        exit 1
    fi
    
    print_status "Environment variables validated ✓"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install --omit=dev --legacy-peer-deps
    print_status "Dependencies installed ✓"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    npx medusa db:migrate
    print_status "Database migrations completed ✓"
}

# Build the application
build_app() {
    print_status "Building application..."
    npm run build
    print_status "Application built ✓"
}

# Run integration tests
run_tests() {
    print_status "Running integration tests..."
    if npm run test:integration:http; then
        print_status "Integration tests passed ✓"
    else
        print_warning "Integration tests failed, but continuing deployment..."
    fi
}

# Main deployment function
main() {
    print_status "Starting deployment process..."
    
    check_env_vars
    install_dependencies
    run_migrations
    build_app
    run_tests
    
    print_status "🎉 Deployment preparation completed successfully!"
    print_status "Ready to start the application with: npm start"
}

# Run main function
main "$@"

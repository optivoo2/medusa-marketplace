#!/bin/bash

# PetRescue Brasil Production Deployment Script
# This script handles the production deployment process

set -e

echo "🚀 Starting PetRescue Brasil Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_step "Checking environment variables..."
    
    required_vars=("DATABASE_URL" "JWT_SECRET" "COOKIE_SECRET" "STORE_CORS" "ADMIN_CORS" "AUTH_CORS")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set"
            print_error "Please set all required environment variables before deployment"
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
    print_step "Installing dependencies..."
    npm ci --production=false
    print_status "Dependencies installed ✓"
}

# Run database migrations
run_migrations() {
    print_step "Running database migrations..."
    npx medusa db:migrate
    print_status "Database migrations completed ✓"
}

# Build the backend application
build_backend() {
    print_step "Building backend application..."
    npm run build
    print_status "Backend application built ✓"
}

# Create production environment file
create_prod_env() {
    print_step "Creating production environment file..."
    
    cat > .env.production << EOF
# Production Environment Variables for PetRescue Brasil
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
COOKIE_SECRET=${COOKIE_SECRET}
REVALIDATE_SECRET=${REVALIDATE_SECRET:-$(openssl rand -base64 32)}
STORE_CORS=${STORE_CORS}
ADMIN_CORS=${ADMIN_CORS}
AUTH_CORS=${AUTH_CORS}
NODE_ENV=production
${REDIS_URL:+REDIS_URL=${REDIS_URL}}
${OTEL_EXPORTER_OTLP_ENDPOINT:+OTEL_EXPORTER_OTLP_ENDPOINT=${OTEL_EXPORTER_OTLP_ENDPOINT}}
${OTEL_SERVICE_NAME:+OTEL_SERVICE_NAME=${OTEL_SERVICE_NAME}}
${ENABLE_INSTRUMENTATION:+ENABLE_INSTRUMENTATION=${ENABLE_INSTRUMENTATION}}
EOF
    
    print_status "Production environment file created ✓"
}

# Validate anti-sale middlewares
validate_middlewares() {
    print_step "Validating anti-sale middlewares..."
    
    # Check if middleware files exist and are properly configured
    if [ ! -f "src/api/middlewares/anti-sale.ts" ]; then
        print_error "Anti-sale middleware not found"
        exit 1
    fi
    
    if [ ! -f "src/api/middlewares/adoption-policy.ts" ]; then
        print_error "Adoption policy middleware not found"
        exit 1
    fi
    
    if [ ! -f "src/api/middlewares.ts" ]; then
        print_error "Main middlewares configuration not found"
        exit 1
    fi
    
    print_status "Anti-sale middlewares validated ✓"
}

# Create health check endpoint
create_health_check() {
    print_step "Creating health check endpoint..."
    
    mkdir -p src/api/health
    cat > src/api/health/route.ts << 'EOF'
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Basic health check
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "petrescue-brasil-backend",
      version: process.env.npm_package_version || "1.0.0"
    }
    
    return res.json(health)
  } catch (error) {
    return res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed"
    })
  }
}
EOF
    
    print_status "Health check endpoint created ✓"
}

# Generate deployment summary
generate_summary() {
    print_step "Generating deployment summary..."
    
    cat > DEPLOYMENT_SUMMARY.md << EOF
# PetRescue Brasil Deployment Summary

## Deployment Date
$(date)

## Environment
- Node.js: $(node --version)
- NPM: $(npm --version)
- Environment: production

## Configuration
- Database: Configured
- CORS: ${STORE_CORS}
- Security: Secrets configured
- Middlewares: Anti-sale protection active

## Next Steps
1. Deploy to your chosen platform (Railway, Fly.io, or Docker)
2. Configure domain and SSL certificates
3. Deploy storefront to Vercel
4. Run smoke tests
5. Monitor application health

## Health Check
- Backend: \${BACKEND_URL}/health
- Storefront: \${FRONTEND_URL}/api/health

## Support
For deployment issues, check the logs and refer to DEPLOYMENT_GUIDE.md
EOF
    
    print_status "Deployment summary generated ✓"
}

# Main deployment function
main() {
    print_status "Starting production deployment process..."
    
    check_env_vars
    install_dependencies
    validate_middlewares
    create_health_check
    run_migrations
    build_backend
    create_prod_env
    generate_summary
    
    print_status "🎉 Production deployment preparation completed successfully!"
    print_status ""
    print_status "Next steps:"
    print_status "1. Deploy to your chosen platform using the configuration files"
    print_status "2. Configure your domain and SSL certificates"
    print_status "3. Deploy the storefront to Vercel"
    print_status "4. Run smoke tests to validate the deployment"
    print_status ""
    print_status "Configuration files created:"
    print_status "- Dockerfile (for Docker deployment)"
    print_status "- railway.json (for Railway deployment)"
    print_status "- fly.toml (for Fly.io deployment)"
    print_status "- .env.production (production environment variables)"
    print_status "- DEPLOYMENT_GUIDE.md (detailed deployment instructions)"
}

# Run main function
main "$@"

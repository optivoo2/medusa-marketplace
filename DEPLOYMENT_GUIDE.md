# PetRescue Brasil - Deployment Guide

This guide provides step-by-step instructions for deploying the PetRescue Brasil platform to production.

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (production-ready)
- Redis instance (optional, for caching)
- Domain names configured
- SSL certificates

## Environment Variables

### Backend (Medusa)

Create a `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Security (MUST be at least 32 characters each)
JWT_SECRET=your-super-secure-jwt-secret-here-32-chars-minimum
COOKIE_SECRET=your-super-secure-cookie-secret-here-32-chars-minimum
REVALIDATE_SECRET=your-super-secure-revalidate-secret-here-32-chars-minimum

# CORS (restrict to production domains)
STORE_CORS=https://app.petrescue.org.br,https://petrescue.org.br
ADMIN_CORS=https://admin.petrescue.org.br
AUTH_CORS=https://app.petrescue.org.br,https://admin.petrescue.org.br

# Redis (optional)
REDIS_URL=redis://username:password@host:port?ssl=true

# Environment
NODE_ENV=production

# Observability (optional)
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-endpoint.com
OTEL_SERVICE_NAME=petrescue-brasil-backend
ENABLE_INSTRUMENTATION=true
```

### Storefront (Next.js)

Create a `.env.production` file in the `storefront/` directory:

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.petrescue.org.br
NEXT_PUBLIC_BASE_URL=https://app.petrescue.org.br
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Deployment Options

### Option 1: Railway (Recommended for Backend)

1. **Connect Repository**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and connect
   railway login
   railway link
   ```

2. **Set Environment Variables**
   ```bash
   railway variables set DATABASE_URL="your-database-url"
   railway variables set JWT_SECRET="your-jwt-secret"
   railway variables set COOKIE_SECRET="your-cookie-secret"
   railway variables set STORE_CORS="https://app.petrescue.org.br"
   railway variables set ADMIN_CORS="https://admin.petrescue.org.br"
   railway variables set AUTH_CORS="https://app.petrescue.org.br"
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Option 2: Fly.io

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login and Initialize**
   ```bash
   fly auth login
   fly launch
   ```

3. **Set Secrets**
   ```bash
   fly secrets set DATABASE_URL="your-database-url"
   fly secrets set JWT_SECRET="your-jwt-secret"
   fly secrets set COOKIE_SECRET="your-cookie-secret"
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

### Option 3: Docker

1. **Build Image**
   ```bash
   docker build -t petrescue-brasil .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     --name petrescue-brasil \
     -p 9000:9000 \
     -e DATABASE_URL="your-database-url" \
     -e JWT_SECRET="your-jwt-secret" \
     -e COOKIE_SECRET="your-cookie-secret" \
     petrescue-brasil
   ```

## Storefront Deployment (Vercel)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   cd storefront
   vercel
   ```

2. **Set Environment Variables in Vercel Dashboard**
   - `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
   - `NEXT_PUBLIC_BASE_URL`
   - `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`

3. **Deploy**
   ```bash
   vercel --prod
   ```

## Database Setup

1. **Create Production Database**
   ```sql
   CREATE DATABASE petrescue_brasil_prod;
   CREATE USER petrescue_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE petrescue_brasil_prod TO petrescue_user;
   ```

2. **Run Migrations**
   ```bash
   npx medusa db:migrate
   ```

3. **Seed Initial Data (Optional)**
   ```bash
   npm run seed:petrescue
   ```

## Post-Deployment Checklist

- [ ] Health check endpoint responding (`/health`)
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] CORS properly configured
- [ ] Anti-sale middlewares active
- [ ] Observability configured (if enabled)
- [ ] Storefront connected to backend
- [ ] Admin dashboard accessible
- [ ] Test adoption flow end-to-end

## Monitoring and Maintenance

### Health Checks
- Backend: `https://api.petrescue.org.br/health`
- Storefront: `https://app.petrescue.org.br/api/health`

### Logs
- Railway: `railway logs`
- Fly.io: `fly logs`
- Docker: `docker logs petrescue-brasil`

### Database Backups
Set up automated daily backups for your PostgreSQL database.

### Security Updates
Regularly update dependencies and monitor for security vulnerabilities.

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check SSL requirements
   - Ensure database is accessible

2. **CORS Errors**
   - Verify CORS configuration
   - Check domain names match exactly

3. **Build Failures**
   - Check Node.js version (20+)
   - Verify all dependencies installed
   - Check for TypeScript errors

### Support
For deployment issues, check the logs and refer to the platform-specific documentation.

## Security Considerations

- Use strong, unique secrets (32+ characters)
- Enable SSL/TLS everywhere
- Restrict CORS to production domains only
- Regular security updates
- Monitor for suspicious activity
- Implement rate limiting
- Use environment-specific configurations

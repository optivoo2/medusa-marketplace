# Railway Deployment Guide for Medusa Marketplace

This guide covers deploying the PetRescue Brasil marketplace to Railway with both backend and storefront services.

## Prerequisites

- Node.js 20+ installed locally
- Railway CLI installed and authenticated
- PostgreSQL and Redis databases provisioned in Railway

## Project Structure

```
medusa-marketplace/
├── src/                    # Backend Medusa application
├── storefront/            # Next.js storefront
├── scripts/               # Deployment helper scripts
├── railway.json          # Backend Railway config
├── nixpacks.toml         # Backend build config
└── RAILWAY_DEPLOYMENT.md  # This guide
```

## Phase 1: Environment Setup

### 1.1 Generate Production Secrets

```bash
# Generate secure secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('COOKIE_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('REVALIDATE_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 1.2 Provision Railway Services

1. **Create Railway Project**: `railway login && railway init`
2. **Add PostgreSQL Plugin**: `railway add postgresql`
3. **Add Redis Plugin**: `railway add redis`
4. **Note connection strings** for environment variables

### 1.3 Backend Environment Variables

Set these in Railway backend service:

```bash
# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}
# Opcional: o backend já habilita TLS automaticamente em ambientes Railway, mas manter explícito ajuda na documentação.
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false  # Default is false unless you provide a valid CA

# Optional: Provide CA material if your provider shares it
# DATABASE_SSL_CA=-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----

# Redis
REDIS_URL=${{Redis.REDIS_URL}}

# CORS (update with your actual domains)
STORE_CORS=https://your-storefront.railway.app
ADMIN_CORS=https://your-backend.railway.app
AUTH_CORS=https://your-backend.railway.app

# Security (use generated secrets)
JWT_SECRET=your-generated-jwt-secret
COOKIE_SECRET=your-generated-cookie-secret

# Medusa Configuration
MEDUSA_BACKEND_URL=https://your-backend.railway.app
MEDUSA_WORKER_MODE=server
PORT=9000
```

> Opcional: se o provedor disponibilizar o certificado CA, defina `DATABASE_SSL_CA` com o conteúdo PEM ou em base64.

> Observação: se você não definir `DATABASE_SSL`, o backend ativa TLS automaticamente quando detecta variáveis `RAILWAY_*`.

## Phase 2: Backend Deployment

### 2.1 Deploy Backend Service

```bash
# From project root
railway up
```

### 2.2 Post-Deploy Setup

After successful deployment, run:

```bash
# Create admin user and API key
railway run node scripts/create-admin-and-api-key.js

# Get the publishable key for storefront
railway run node scripts/get-api-key.js
```

### 2.3 Verify Backend

Test these endpoints:
- `GET /health` - Health check
- `GET /store/products` - Store API
- `GET /admin` - Admin interface

## Phase 3: Storefront Deployment

### 3.1 Create Storefront Service

```bash
# Create new service for storefront
railway service create storefront
```

### 3.2 Set Storefront Environment Variables

```bash
# Backend URLs
MEDUSA_BACKEND_URL=https://your-backend.railway.app
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-backend.railway.app

# API Key (from step 2.2)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_key_here

# Storefront Configuration
NEXT_PUBLIC_BASE_URL=https://your-storefront.railway.app
NEXT_PUBLIC_DEFAULT_REGION=br
REVALIDATE_SECRET=your-generated-revalidate-secret
PORT=8000
```

### 3.3 Deploy Storefront

```bash
# Set build path to storefront directory
railway service connect storefront
railway variables set RAILWAY_REPO_PATH=storefront
railway up
```

## Phase 4: Verification & Testing

### 4.1 Smoke Tests

1. **Backend Health**: `curl https://your-backend.railway.app/health`
2. **Storefront**: Visit `https://your-storefront.railway.app`
3. **Admin Login**: Visit `https://your-backend.railway.app/admin`
4. **API Integration**: Verify storefront can fetch products

### 4.2 Environment Validation

```bash
# Backend validation
railway run node scripts/pre-start.js

# Storefront validation
railway run --service storefront node scripts/check-env-variables.js
```

## Phase 5: Production Hardening

### 5.1 Security Checklist

- [ ] All secrets are strong and unique
- [ ] CORS origins are properly configured
- [ ] HTTPS is enforced (Railway default)
- [ ] Admin password is changed from default

### 5.2 Monitoring Setup

- Enable Railway metrics and logs
- Set up health check monitoring
- Configure error alerting

### 5.3 Backup Strategy

- Railway provides automatic PostgreSQL backups
- Document recovery procedures
- Test backup restoration

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Verify REDIS_URL format
   - Check Redis plugin is attached

2. **CORS Errors**
   - Update CORS origins with actual domains
   - Ensure both HTTP and HTTPS are covered

3. **Storefront Can't Connect to Backend**
   - Verify MEDUSA_BACKEND_URL is correct
   - Check publishable key is valid
   - Ensure backend is running

4. **Migration Failures**
   - Check DATABASE_URL format
   - Verify database permissions
   - Run migrations manually if needed

### Debug Commands

```bash
# Check backend logs
railway logs

# Check storefront logs
railway logs --service storefront

# Run pre-start validation
railway run node scripts/pre-start.js

# Test database connection
railway run npx medusa db:migrate
```

## Maintenance

### Regular Tasks

1. **Security Updates**: Keep dependencies updated
2. **Secret Rotation**: Rotate JWT_SECRET and COOKIE_SECRET periodically
3. **Database Maintenance**: Monitor PostgreSQL performance
4. **Backup Verification**: Test restore procedures

### Scaling Considerations

- Railway auto-scales based on traffic
- Consider Redis clustering for high traffic
- Monitor database connection limits
- Set up proper logging and monitoring

## Support

For issues specific to this deployment:
1. Check Railway documentation
2. Review Medusa v2 deployment guides
3. Consult project-specific troubleshooting in this guide

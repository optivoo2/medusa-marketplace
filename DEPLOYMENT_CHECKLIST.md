# Railway Deployment Checklist

## Pre-Deployment Checklist

### ✅ Environment & Dependencies
- [ ] Node.js 20+ installed locally
- [ ] Railway CLI installed and authenticated (`railway login`)
- [ ] All required dependencies installed (`npm install`)
- [ ] Redis client dependency added to package.json

### ✅ Configuration Files Created
- [ ] `.env.production.template` - Environment template
- [ ] `scripts/create-admin-and-api-key.js` - Admin setup script
- [ ] `scripts/get-api-key.js` - API key retrieval script
- [ ] `scripts/deploy-to-railway.js` - Automated deployment script
- [ ] `scripts/railway-quick-start.sh` - Quick start script
- [ ] `storefront/railway.json` - Storefront Railway config
- [ ] `storefront/nixpacks.toml` - Storefront build config
- [ ] `storefront/scripts/check-env-variables.js` - Environment validation

### ✅ Backend Readiness
- [ ] `medusa-config.ts` validates required environment variables
- [ ] Redis modules configured for production
- [ ] Database migrations ready (`scripts/release.sh`)
- [ ] Pre-start validation script (`scripts/pre-start.js`)
- [ ] Health check endpoint configured (`/health`)

### ✅ Storefront Readiness
- [ ] Environment variable naming aligned (both `MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_MEDUSA_BACKEND_URL`)
- [ ] Build configuration optimized for Railway
- [ ] Environment validation script ready
- [ ] Port configuration set to 8000

## Deployment Steps

### Phase 1: Railway Setup
1. **Initialize Project**
   ```bash
   railway init
   ```

2. **Add Services**
   ```bash
   railway add postgresql
   railway add redis
   ```

3. **Generate Secrets**
   ```bash
   node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
   node -e "console.log('COOKIE_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
   node -e "console.log('REVALIDATE_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
   ```

### Phase 2: Backend Deployment
1. **Set Environment Variables**
   ```bash
   railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'
   railway variables set REDIS_URL='${{Redis.REDIS_URL}}'
   railway variables set STORE_CORS='https://storefront.railway.app'
   railway variables set ADMIN_CORS='https://backend.railway.app'
   railway variables set AUTH_CORS='https://backend.railway.app'
   railway variables set JWT_SECRET='your-generated-secret'
   railway variables set COOKIE_SECRET='your-generated-secret'
   railway variables set MEDUSA_BACKEND_URL='https://backend.railway.app'
   railway variables set MEDUSA_WORKER_MODE='server'
   railway variables set PORT='9000'
   ```

2. **Deploy Backend**
   ```bash
   railway up
   ```

3. **Setup Admin User**
   ```bash
   railway run node scripts/create-admin-and-api-key.js
   ```

4. **Get Publishable Key**
   ```bash
   railway run node scripts/get-api-key.js
   ```

### Phase 3: Storefront Deployment
1. **Create Storefront Service**
   ```bash
   railway service create storefront
   ```

2. **Set Storefront Environment**
   ```bash
   railway variables set --service storefront MEDUSA_BACKEND_URL='https://backend.railway.app'
   railway variables set --service storefront NEXT_PUBLIC_MEDUSA_BACKEND_URL='https://backend.railway.app'
   railway variables set --service storefront NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY='pk_your_key_here'
   railway variables set --service storefront NEXT_PUBLIC_BASE_URL='https://storefront.railway.app'
   railway variables set --service storefront NEXT_PUBLIC_DEFAULT_REGION='br'
   railway variables set --service storefront REVALIDATE_SECRET='your-generated-secret'
   railway variables set --service storefront PORT='8000'
   railway variables set --service storefront RAILWAY_REPO_PATH='storefront'
   ```

3. **Deploy Storefront**
   ```bash
   railway up --service storefront
   ```

## Post-Deployment Verification

### ✅ Backend Tests
- [ ] Health check: `curl https://backend.railway.app/health`
- [ ] Store API: `curl https://backend.railway.app/store/products`
- [ ] Admin interface: Visit `https://backend.railway.app/admin`
- [ ] Database connectivity verified
- [ ] Redis connectivity verified

### ✅ Storefront Tests
- [ ] Homepage loads: Visit `https://storefront.railway.app`
- [ ] Product pages load correctly
- [ ] API integration working (products fetch from backend)
- [ ] Environment variables validated
- [ ] No console errors in browser

### ✅ Integration Tests
- [ ] Storefront can authenticate with backend
- [ ] Publishable key is valid and working
- [ ] CORS configuration allows cross-origin requests
- [ ] Admin login works with default credentials
- [ ] Database migrations applied successfully

## Security Checklist

### ✅ Secrets Management
- [ ] All secrets are strong and unique (not 'supersecret')
- [ ] JWT_SECRET is cryptographically secure
- [ ] COOKIE_SECRET is cryptographically secure
- [ ] REVALIDATE_SECRET is cryptographically secure

### ✅ CORS Configuration
- [ ] STORE_CORS includes storefront domain
- [ ] ADMIN_CORS includes backend domain
- [ ] AUTH_CORS includes backend domain
- [ ] No wildcard (*) origins in production

### ✅ HTTPS & Security
- [ ] All services use HTTPS (Railway default)
- [ ] Admin password changed from default
- [ ] Sensitive endpoints protected
- [ ] Database credentials secure

## Monitoring & Maintenance

### ✅ Observability
- [ ] Railway metrics enabled
- [ ] Log aggregation configured
- [ ] Health checks monitoring
- [ ] Error alerting set up

### ✅ Backup Strategy
- [ ] PostgreSQL backups enabled (Railway default)
- [ ] Backup restoration tested
- [ ] Recovery procedures documented
- [ ] Data retention policy defined

## Troubleshooting

### Common Issues & Solutions

1. **Redis Connection Failed**
   - Verify REDIS_URL format
   - Check Redis plugin attachment
   - Ensure redis dependency installed

2. **CORS Errors**
   - Update CORS origins with actual domains
   - Verify both HTTP and HTTPS origins
   - Check middleware configuration

3. **Storefront Can't Connect**
   - Verify MEDUSA_BACKEND_URL
   - Check publishable key validity
   - Ensure backend is running

4. **Migration Failures**
   - Verify DATABASE_URL format
   - Check database permissions
   - Run migrations manually if needed

## Quick Commands

```bash
# Full automated deployment
npm run railway:deploy

# Quick start script
./scripts/railway-quick-start.sh

# Manual admin setup
npm run railway:setup-admin

# Get API key
npm run railway:get-key

# Check backend health
railway run node scripts/pre-start.js

# Check storefront env
railway run --service storefront node scripts/check-env-variables.js
```

## Success Criteria

- [ ] Backend deploys successfully with all services
- [ ] Storefront deploys and connects to backend
- [ ] Admin interface accessible and functional
- [ ] Store API returns products correctly
- [ ] All health checks pass
- [ ] No critical errors in logs
- [ ] Performance metrics within acceptable ranges

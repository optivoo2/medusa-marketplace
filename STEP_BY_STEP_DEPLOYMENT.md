# 🚀 PetRescue Brasil - Step by Step Deployment Guide

## Prerequisites Checklist
- [ ] Node.js 20+ installed
- [ ] Git repository access
- [ ] Vercel account (✅ Already authenticated as `optivoo2`)
- [ ] Railway/Fly.io account (for backend deployment)
- [ ] Domain names configured (api.petrescue.org.br, app.petrescue.org.br)

## Step 1: Deploy Backend (Medusa)

### Option A: Railway (Recommended)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Navigate to project root**:
   ```bash
   cd /home/arthur/medusa-marketplace
   ```

4. **Initialize Railway project**:
   ```bash
   railway init
   ```

5. **Set environment variables**:
   ```bash
   railway variables set DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   railway variables set JWT_SECRET="your-super-secure-jwt-secret-here-32-chars-minimum"
   railway variables set COOKIE_SECRET="your-super-secure-cookie-secret-here-32-chars-minimum"
   railway variables set REVALIDATE_SECRET="your-super-secure-revalidate-secret-here-32-chars-minimum"
   railway variables set STORE_CORS="https://app.petrescue.org.br,https://petrescue.org.br"
   railway variables set ADMIN_CORS="https://admin.petrescue.org.br"
   railway variables set AUTH_CORS="https://app.petrescue.org.br,https://admin.petrescue.org.br"
   railway variables set NODE_ENV="production"
   ```

6. **Deploy**:
   ```bash
   railway up
   ```

### Option B: Fly.io

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly**:
   ```bash
   fly auth login
   ```

3. **Initialize project**:
   ```bash
   fly launch
   ```

4. **Set secrets**:
   ```bash
   fly secrets set DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   fly secrets set JWT_SECRET="your-super-secure-jwt-secret-here-32-chars-minimum"
   fly secrets set COOKIE_SECRET="your-super-secure-cookie-secret-here-32-chars-minimum"
   fly secrets set STORE_CORS="https://app.petrescue.org.br,https://petrescue.org.br"
   fly secrets set ADMIN_CORS="https://admin.petrescue.org.br"
   fly secrets set AUTH_CORS="https://app.petrescue.org.br,https://admin.petrescue.org.br"
   ```

5. **Deploy**:
   ```bash
   fly deploy
   ```

### Option C: Docker

1. **Build Docker image**:
   ```bash
   docker build -t petrescue-brasil .
   ```

2. **Run container**:
   ```bash
   docker run -d \
     --name petrescue-brasil \
     -p 9000:9000 \
     -e DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require" \
     -e JWT_SECRET="your-super-secure-jwt-secret-here-32-chars-minimum" \
     -e COOKIE_SECRET="your-super-secure-cookie-secret-here-32-chars-minimum" \
     -e STORE_CORS="https://app.petrescue.org.br,https://petrescue.org.br" \
     -e ADMIN_CORS="https://admin.petrescue.org.br" \
     -e AUTH_CORS="https://app.petrescue.org.br,https://admin.petrescue.org.br" \
     -e NODE_ENV="production" \
     petrescue-brasil
   ```

## Step 2: Verify Backend Deployment

1. **Check health endpoint**:
   ```bash
   curl https://your-backend-url.com/health
   ```

2. **Expected response**:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-09-16T21:30:00.000Z",
     "service": "petrescue-brasil-backend",
     "version": "1.0.0",
     "environment": "production",
     "features": {
       "antiSaleProtection": true,
       "adoptionPolicy": true,
       "observability": false
     }
   }
   ```

## Step 3: Deploy Storefront (Vercel)

1. **Navigate to storefront**:
   ```bash
   cd /home/arthur/medusa-marketplace/storefront
   ```

2. **Update backend URL** (if needed):
   ```bash
   vercel env rm NEXT_PUBLIC_MEDUSA_BACKEND_URL production
   echo "https://your-actual-backend-url.com" | vercel env add NEXT_PUBLIC_MEDUSA_BACKEND_URL production
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel --yes
   ```

4. **Verify deployment**:
   - Visit the provided Vercel URL
   - Check that the storefront loads correctly
   - Verify it connects to your backend

## Step 4: Configure Domain and SSL

1. **Backend Domain**:
   - Point `api.petrescue.org.br` to your backend URL
   - Ensure SSL certificate is configured

2. **Storefront Domain**:
   - In Vercel dashboard, add custom domain `app.petrescue.org.br`
   - Configure DNS records as instructed by Vercel

3. **Admin Dashboard**:
   - Point `admin.petrescue.org.br` to your backend admin URL
   - Ensure SSL certificate is configured

## Step 5: Final Configuration

1. **Update CORS settings** (if needed):
   ```bash
   # Update backend environment variables with actual domains
   railway variables set STORE_CORS="https://app.petrescue.org.br,https://petrescue.org.br"
   railway variables set ADMIN_CORS="https://admin.petrescue.org.br"
   railway variables set AUTH_CORS="https://app.petrescue.org.br,https://admin.petrescue.org.br"
   ```

2. **Update storefront environment**:
   ```bash
   vercel env rm NEXT_PUBLIC_MEDUSA_BACKEND_URL production
   echo "https://api.petrescue.org.br" | vercel env add NEXT_PUBLIC_MEDUSA_BACKEND_URL production
   
   vercel env rm NEXT_PUBLIC_BASE_URL production
   echo "https://app.petrescue.org.br" | vercel env add NEXT_PUBLIC_BASE_URL production
   ```

3. **Redeploy storefront**:
   ```bash
   vercel --yes
   ```

## Step 6: Run Smoke Tests

1. **Test backend health**:
   ```bash
   curl https://api.petrescue.org.br/health
   ```

2. **Test storefront**:
   - Visit `https://app.petrescue.org.br`
   - Verify homepage loads
   - Check that it connects to backend

3. **Test anti-sale protection**:
   - Try to create an adoption listing
   - Attempt to purchase an adoption product (should be blocked)
   - Verify error messages are in Portuguese

4. **Test admin dashboard**:
   - Visit `https://admin.petrescue.org.br`
   - Verify login works
   - Check protector dashboard functionality

## Step 7: Monitor and Maintain

1. **Set up monitoring**:
   - Monitor backend health endpoint
   - Set up error tracking (Sentry, etc.)
   - Monitor application logs

2. **Regular maintenance**:
   - Database backups
   - Security updates
   - Performance monitoring

## Troubleshooting

### Common Issues

1. **Backend not accessible**:
   - Check environment variables
   - Verify database connection
   - Check logs for errors

2. **Storefront build fails**:
   - Ensure backend is deployed and accessible
   - Check environment variables in Vercel
   - Verify CORS settings

3. **CORS errors**:
   - Update CORS settings in backend
   - Ensure domains match exactly
   - Check for trailing slashes

### Support Commands

```bash
# Check Vercel deployment status
vercel ls

# Check Railway deployment status
railway status

# Check Fly deployment status
fly status

# View logs
railway logs
fly logs
vercel logs
```

## Success Criteria

- [ ] Backend deployed and accessible at `https://api.petrescue.org.br`
- [ ] Storefront deployed and accessible at `https://app.petrescue.org.br`
- [ ] Admin dashboard accessible at `https://admin.petrescue.org.br`
- [ ] Health check endpoint responding
- [ ] Anti-sale middlewares active
- [ ] SSL certificates configured
- [ ] Smoke tests passing

## Next Steps After Deployment

1. **Create initial data**:
   - Add adoption categories
   - Create sample adoption listings
   - Set up protector accounts

2. **Configure analytics**:
   - Google Analytics
   - Error tracking
   - Performance monitoring

3. **Set up support**:
   - Contact forms
   - Support email
   - Documentation

---

**Ready to deploy?** Start with Step 1 and follow each step carefully. The backend must be deployed first before the storefront can be successfully deployed.

# Railway Deployment Guide for MedusaJS Marketplace

## Prerequisites
1. Railway account (sign up at https://railway.app)
2. GitHub repository with your code

## Step 1: Create Railway Project

### Option A: Using Railway Web Interface (Recommended)
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `medusa-marketplace` repository
5. Railway will automatically detect it's a Node.js project

### Option B: Using Railway CLI
```bash
# Login to Railway (requires interactive browser)
npx @railway/cli@latest login

# Create new project
npx @railway/cli@latest init

# Link to existing project
npx @railway/cli@latest link
```

## Step 2: Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL instance
4. Note the connection details (will be available as `DATABASE_URL`)

## Step 3: Add Redis Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "Redis"
3. Railway will automatically create a Redis instance
4. Note the connection details (will be available as `REDIS_URL`)

## Step 4: Configure Environment Variables

Set these environment variables in your Railway project:

### Required Variables
```bash
# Database
DATABASE_URL=${{Postgres.DATABASE_PUBLIC_URL}}
REDIS_URL=${{Redis.REDIS_PUBLIC_URL}}

# Security (Generate secure secrets!)
JWT_SECRET=your-super-secure-jwt-secret-here
COOKIE_SECRET=your-super-secure-cookie-secret-here

# CORS (Update with your actual URLs after deployment)
STORE_CORS=https://your-storefront-url.com
ADMIN_CORS=https://your-admin-url.com
AUTH_CORS=https://your-storefront-url.com,https://your-admin-url.com

# Medusa Configuration
MEDUSA_WORKER_MODE=server
DISABLE_MEDUSA_ADMIN=false
PORT=9000

# Backend URL (Update after deployment)
MEDUSA_BACKEND_URL=https://your-railway-app-url.railway.app
```

### How to Set Environment Variables in Railway:
1. Go to your project dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add each variable with its value

## Step 5: Deploy

Railway will automatically deploy when you push to your main branch, or you can trigger a manual deployment.

## Step 6: Post-Deployment Configuration

After deployment, update these environment variables with your actual Railway app URL:

```bash
# Get your Railway app URL from the dashboard
MEDUSA_BACKEND_URL=https://your-actual-railway-url.railway.app

# Update CORS settings
STORE_CORS=https://your-storefront-url.com
ADMIN_CORS=https://your-railway-url.railway.app
AUTH_CORS=https://your-storefront-url.com,https://your-railway-url.railway.app
```

## Step 7: Create Admin User

After deployment, create an admin user:

```bash
# Using Railway CLI
npx @railway/cli@latest run npx medusa user --email admin@yourdomain.com --password your-secure-password

# Or using Railway web interface
# Go to your service → "Deployments" → "View Logs" → "Run Command"
```

## Step 8: Test Your Deployment

1. **Health Check**: `https://your-railway-url.railway.app/health`
2. **Admin Dashboard**: `https://your-railway-url.railway.app/app`
3. **Store API**: `https://your-railway-url.railway.app/store/products`

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check that all dependencies are in `package.json`
2. **Database Connection**: Verify `DATABASE_URL` is correctly set
3. **CORS Errors**: Ensure CORS URLs match your actual deployed URLs
4. **Admin Not Loading**: Check `MEDUSA_BACKEND_URL` and `ADMIN_CORS`

### View Logs:
```bash
npx @railway/cli@latest logs
```

## Production Considerations

1. **Security**: Use strong, randomly generated secrets
2. **Monitoring**: Set up Railway's built-in monitoring
3. **Backups**: Railway handles database backups automatically
4. **Scaling**: Railway can auto-scale based on traffic

## Cost Estimation

Railway pricing is based on usage:
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage
- **Database**: Included in plans
- **Bandwidth**: Pay per GB

## Next Steps

1. Set up a custom domain (optional)
2. Configure SSL certificates (automatic with Railway)
3. Set up monitoring and alerts
4. Configure CI/CD for automatic deployments

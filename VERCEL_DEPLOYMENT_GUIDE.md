# Vercel Deployment Guide for Zeeky AI

## Overview
This guide provides complete instructions for deploying Zeeky AI to Vercel with optimal configuration.

## Vercel Configuration Settings

### Framework Settings
- **Framework Preset:** `Other`
- **Root Directory:** `./`
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `frontend`
- **Install Command:** `npm install`

### Environment Variables
Add the following environment variables in your Vercel dashboard:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `EXAMPLE_NAME` | `I9JU23NF394R6HH` | Your custom environment variable |

## Build Scripts
The following build scripts have been configured in `package.json`:

```json
{
  "scripts": {
    "build": "npm run build:optimize && echo 'Zeeky AI static site ready for deployment'",
    "vercel-build": "npm run build:optimize && echo 'Vercel build complete - static site ready'",
    "build:optimize": "node scripts/build-optimizer.js",
    "build:compress": "node scripts/compress-assets.js"
  }
}
```

## Deployment Steps

### 1. Initial Setup
1. Install Vercel CLI: `npm install -g vercel`
2. Login to Vercel: `vercel login`
3. Link your project: `vercel link`

### 2. Deploy to Vercel
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 3. Custom Domain Setup
1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Add your custom domain in the "Domains" section
4. Configure DNS records as instructed by Vercel

## File Structure
```
├── frontend/           # Static files served by Vercel
│   ├── index.html     # Main entry point
│   ├── assets/        # Static assets
│   ├── scripts/       # JavaScript files
│   └── styles/        # CSS files
├── vercel.json        # Vercel configuration
├── package.json       # Node.js dependencies and scripts
└── app.py            # Python backend (Vercel Functions)
```

## Security Headers
The deployment includes security headers configured in `vercel.json`:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer Policy

## Performance Optimizations
- Static file compression
- Asset optimization
- CDN distribution via Vercel Edge Network
- Automatic HTTPS

## Troubleshooting

### Common Issues
1. **Build Fails**: Check build logs in Vercel dashboard
2. **404 Errors**: Verify output directory is set to `frontend`
3. **Environment Variables**: Ensure all required env vars are set

### Support Commands
```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Remove deployment
vercel rm [deployment-name]
```

## Monitoring
- Use Vercel Analytics for performance monitoring
- Check deployment logs for errors
- Monitor build times and success rates

## Next Steps
1. Set up custom domain
2. Configure environment variables
3. Enable Vercel Analytics
4. Set up deployment notifications

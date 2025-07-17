# 🌐 Custom Domain Setup for Zeeky AI

## 📋 Domain Setup Options

### Option 1: Purchase New Domain

**Recommended Registrars:**
- **Namecheap** (affordable, good support)
- **Google Domains** (easy integration)
- **Cloudflare** (includes CDN/security)
- **GoDaddy** (popular, more expensive)

**Suggested Domain Names:**
- `zeekyai.com`
- `zeeky-ai.com` 
- `askzeeky.com`
- `zeekyassistant.com`
- `myzeeky.ai`

### Option 2: Use Existing Domain

If you already have a domain, you can use a subdomain:
- `zeeky.yourdomain.com`
- `ai.yourdomain.com`
- `assistant.yourdomain.com`

## 🔧 Netlify Domain Configuration

### Step 1: Add Domain in Netlify

1. **Go to Site Settings**: In your Netlify dashboard
2. **Domain Management**: Click "Domain management"
3. **Add Custom Domain**: Click "Add custom domain"
4. **Enter Domain**: Type your domain (e.g., `zeekyai.com`)
5. **Verify Ownership**: Netlify will guide you through verification

### Step 2: Configure DNS Records

**For Root Domain (zeekyai.com):**
```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600
```

**For WWW Subdomain:**
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
TTL: 3600
```

**Alternative (CNAME for root - if supported):**
```
Type: CNAME
Name: @
Value: your-site-name.netlify.app
TTL: 3600
```

### Step 3: SSL Certificate

Netlify automatically provides free SSL certificates via Let's Encrypt:
- ✅ Automatic renewal
- ✅ Wildcard support for subdomains
- ✅ Usually activates within minutes

## 🌍 DNS Provider Instructions

### Namecheap
1. Login to Namecheap account
2. Go to "Domain List" → Manage
3. Click "Advanced DNS"
4. Add the DNS records above
5. Wait 5-30 minutes for propagation

### Cloudflare
1. Add your domain to Cloudflare
2. Update nameservers at your registrar
3. Add DNS records in Cloudflare dashboard
4. Enable "Proxy status" for additional security

### Google Domains
1. Go to Google Domains dashboard
2. Click your domain → DNS
3. Add custom resource records
4. Use the DNS records above

## 🧪 Testing Your Domain

### DNS Propagation Check
Use these tools to verify DNS setup:
- [whatsmydns.net](https://whatsmydns.net)
- [dnschecker.org](https://dnschecker.org)

### SSL Certificate Check
- Visit `https://yourdomain.com`
- Check for green lock icon
- Use [SSL Labs Test](https://ssllabs.com/ssltest/)

## 🚀 Domain Setup Checklist

### Pre-Setup:
- [ ] Choose and purchase domain
- [ ] Have Netlify site URL ready
- [ ] Access to domain registrar account

### Configuration:
- [ ] Add custom domain in Netlify
- [ ] Configure DNS A record for root domain
- [ ] Configure DNS CNAME for www subdomain
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Verify SSL certificate activation

### Testing:
- [ ] Visit `http://yourdomain.com` (should redirect to HTTPS)
- [ ] Visit `https://yourdomain.com` (should load site)
- [ ] Visit `https://www.yourdomain.com` (should work)
- [ ] Test on mobile devices
- [ ] Check SSL certificate validity

## 🔧 Advanced Configuration

### Email Setup
If you want email with your domain:
- **Google Workspace** (professional)
- **Zoho Mail** (free tier available)
- **ProtonMail** (privacy-focused)

### Subdomain Ideas
- `api.yourdomain.com` - For backend API
- `docs.yourdomain.com` - Documentation
- `blog.yourdomain.com` - Blog/updates
- `status.yourdomain.com` - Status page

### CDN & Performance
Netlify includes:
- ✅ Global CDN
- ✅ Automatic compression
- ✅ Image optimization
- ✅ Edge functions

## 🚨 Common Issues & Solutions

### Issue: Domain not resolving
**Solution:** Check DNS propagation, verify records are correct

### Issue: SSL certificate not working
**Solution:** Wait 24 hours, check domain verification in Netlify

### Issue: www not working
**Solution:** Add CNAME record for www subdomain

### Issue: Mixed content errors
**Solution:** Ensure all resources use HTTPS

## 💰 Cost Breakdown

**Domain Registration:**
- `.com` domain: $10-15/year
- `.ai` domain: $60-100/year
- `.io` domain: $30-50/year

**Hosting (Netlify):**
- Free tier: $0/month (100GB bandwidth)
- Pro tier: $19/month (1TB bandwidth)

**Email (Optional):**
- Google Workspace: $6/user/month
- Zoho Mail: Free for 5 users

## 🎯 Recommended Setup

For Zeeky AI, I recommend:

1. **Domain**: `zeekyai.com` or `askzeeky.com`
2. **Registrar**: Namecheap or Google Domains
3. **DNS**: Use registrar's DNS or Cloudflare
4. **Email**: Google Workspace for professional look
5. **Subdomains**: 
   - `api.zeekyai.com` for backend
   - `docs.zeekyai.com` for documentation

## 🎉 Success!

Once configured, your Zeeky AI will be accessible at:
- `https://yourdomain.com`
- `https://www.yourdomain.com`

With professional branding and global CDN performance!

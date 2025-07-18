# Netlify Deployment Troubleshooting Guide

## 🚀 Current Status

The repository now includes a **minimal, validated netlify.toml** configuration that should resolve the configuration parsing errors.

## 📋 Configuration Files Available

### 1. **netlify.toml** (Current - Minimal & Safe)
```toml
[build]
  command = "npm run build"
  publish = "."
  base = "."

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
```
- ✅ **18 lines** - Minimal and clean
- ✅ **TOML syntax validated**
- ✅ **Explicit base directory** set to "."
- ✅ **SPA routing** configured
- ✅ **Basic security** headers

### 2. **netlify-basic.toml** (Ultra-Minimal Fallback)
```toml
[build]
  command = "npm run build"
  publish = "."
  base = "."

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
- ✅ **11 lines** - Absolute minimum
- ✅ **No headers** - Eliminates potential header syntax issues

### 3. **netlify-conservative.toml** (With 1 Edge Function)
```toml
[build]
  command = "npm run build"
  publish = "."
  base = "."
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "8"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[edge_functions]]
  function = "personalization"
  path = "/*"
```
- ✅ **Functions directory** configured
- ✅ **API routing** for Netlify Functions
- ✅ **One edge function** for testing
- ✅ **Enhanced security** headers

### 4. **netlify-full.toml.backup** (Complete Configuration)
- ✅ **All 5 edge functions** (personalization, localization, performance, api-aggregator, auth)
- ✅ **Complete header** configuration
- ✅ **Full feature set**

## 🔧 Deployment Strategy

### Step 1: Test Basic Deployment
The current minimal configuration should work. If it still fails:

1. **Replace with ultra-minimal**:
   ```bash
   cp netlify-basic.toml netlify.toml
   git add netlify.toml
   git commit -m "Use ultra-minimal netlify.toml"
   git push origin main
   ```

### Step 2: Gradually Add Features
Once basic deployment works:

1. **Add functions support**:
   ```bash
   cp netlify-conservative.toml netlify.toml
   git add netlify.toml
   git commit -m "Add functions and one edge function"
   git push origin main
   ```

2. **Add all edge functions**:
   ```bash
   cp netlify-full.toml.backup netlify.toml
   git add netlify.toml
   git commit -m "Enable all edge functions"
   git push origin main
   ```

## 🔍 Common Issues & Solutions

### Issue 1: "Base directory does not exist"
**Solution**: The current config explicitly sets `base = "."` which should resolve this.

### Issue 2: "Failed to parse configuration"
**Solutions**:
1. Use `netlify-basic.toml` (ultra-minimal)
2. Check for hidden characters: `cat -A netlify.toml`
3. Validate TOML syntax: `python3 -c "import toml; toml.load('netlify.toml')"`

### Issue 3: Edge Functions not deploying
**Solutions**:
1. Start with `netlify-conservative.toml` (1 edge function)
2. Ensure edge function files exist in `netlify/edge-functions/`
3. Check JavaScript syntax: `node -c netlify/edge-functions/personalization.js`

### Issue 4: Build command fails
**Solutions**:
1. Verify `npm run build` works locally
2. Check `package.json` has build script
3. Use simpler build command: `command = "echo 'Build complete'"`

## 📁 File Structure Verification

Ensure these files exist:
```
├── netlify.toml                    ✅ (current minimal config)
├── package.json                    ✅ (with build script)
├── index.html                      ✅ (main entry point)
├── netlify/
│   ├── functions/
│   │   └── ai-chat.js             ✅ (Netlify Function)
│   └── edge-functions/
│       ├── personalization.js     ✅ (Edge Function)
│       ├── localization.js        ✅ (Edge Function)
│       ├── performance.js         ✅ (Edge Function)
│       ├── api-aggregator.js      ✅ (Edge Function)
│       └── auth.js                ✅ (Edge Function)
```

## 🚀 Expected Deployment Results

### With Current Minimal Config:
- ✅ **Basic static site** deployment
- ✅ **SPA routing** (/* → /index.html)
- ✅ **Security headers**
- ❌ **No edge functions** (for now)
- ❌ **No Netlify functions** (for now)

### After Adding Conservative Config:
- ✅ **Netlify Functions** enabled
- ✅ **One edge function** (personalization)
- ✅ **API routing** (/api/* → functions)

### After Adding Full Config:
- ✅ **All 5 edge functions** enabled
- ✅ **Complete feature set**
- ✅ **Full personalization** and localization

## 🆘 Emergency Fallback

If all configurations fail, use this absolute minimal config:

```toml
[build]
  publish = "."
```

This 2-line configuration should work with any static site.

## 📞 Support

If issues persist:
1. Check Netlify build logs for specific error messages
2. Verify all files are committed to the repository
3. Test locally: `npm run build`
4. Use Netlify CLI: `netlify dev` for local testing

The current minimal configuration should resolve the parsing errors and allow successful deployment! 🌟

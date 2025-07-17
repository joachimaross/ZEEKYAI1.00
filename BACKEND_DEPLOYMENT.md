# 🚀 Zeeky AI Backend Deployment Guide

## 📋 Backend Deployment Options

### Option 1: Railway (Recommended - Free & Easy)

1. **Visit Railway**: Go to [railway.app](https://railway.app)
2. **Sign up/Login** with GitHub
3. **New Project**: Click "New Project" → "Deploy from GitHub repo"
4. **Select Repository**: Choose `joachimaross/ZEEKYAI1.00`
5. **Configure**:
   - Railway will auto-detect Python and use `railway.json`
   - Add environment variables in dashboard:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `GEMINI_API_KEY`: Your Gemini API key (optional)
6. **Deploy**: Railway will automatically deploy
7. **Get URL**: Copy your Railway app URL (e.g., `https://your-app.railway.app`)

### Option 2: Render (Free Tier Available)

1. **Visit Render**: Go to [render.com](https://render.com)
2. **Sign up/Login** with GitHub
3. **New Web Service**: Click "New" → "Web Service"
4. **Connect Repository**: Select `joachimaross/ZEEKYAI1.00`
5. **Configure**:
   - **Name**: `zeeky-ai-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
6. **Environment Variables**:
   - Add `OPENAI_API_KEY` in dashboard
   - Add `GEMINI_API_KEY` (optional)
7. **Deploy**: Click "Create Web Service"
8. **Get URL**: Copy your Render app URL

### Option 3: Heroku (Requires Credit Card)

1. **Install Heroku CLI**: Download from [heroku.com](https://heroku.com)
2. **Login**: `heroku login`
3. **Create App**: `heroku create your-zeeky-backend`
4. **Set Environment Variables**:
   ```bash
   heroku config:set OPENAI_API_KEY=your-key-here
   heroku config:set GEMINI_API_KEY=your-key-here
   ```
5. **Deploy**:
   ```bash
   git push heroku main
   ```
6. **Get URL**: `https://your-zeeky-backend.herokuapp.com`

## 🔧 Environment Variables Needed

For any deployment platform, set these environment variables:

- **`OPENAI_API_KEY`**: Your OpenAI API key (required)
- **`GEMINI_API_KEY`**: Your Google Gemini API key (optional)
- **`PORT`**: Usually set automatically by the platform

## 🧪 Testing Your Backend

Once deployed, test these endpoints:

1. **Health Check**: `GET https://your-backend-url/health`
2. **System Status**: `GET https://your-backend-url/`
3. **Chat Test**: `POST https://your-backend-url/chat`
   ```json
   {
     "message": "Hello Zeeky!",
     "personality": "default"
   }
   ```

## 🔗 CORS Configuration

Your backend is already configured for CORS with:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For production, update `allow_origins` to your Netlify domain:
```python
allow_origins=["https://your-site.netlify.app"]
```

## 🚨 Important Notes

1. **API Keys**: Never commit API keys to GitHub. Always use environment variables.
2. **Database**: Current setup uses in-memory storage. For production, consider adding a real database.
3. **Rate Limiting**: Consider adding rate limiting for production use.
4. **Monitoring**: Add logging and monitoring for production deployments.

## 📊 Deployment Status Check

After deployment, verify:
- ✅ Backend URL is accessible
- ✅ `/health` endpoint returns 200
- ✅ `/` endpoint returns system info
- ✅ `/chat` endpoint accepts POST requests
- ✅ Environment variables are set correctly
- ✅ CORS is working (no browser errors)

## 🔄 Next Steps After Backend Deployment

1. Copy your backend URL
2. Update frontend to use the real API
3. Test full integration
4. Monitor logs for any issues

Your backend URL will look like:
- Railway: `https://your-app.railway.app`
- Render: `https://your-app.onrender.com`
- Heroku: `https://your-app.herokuapp.com`

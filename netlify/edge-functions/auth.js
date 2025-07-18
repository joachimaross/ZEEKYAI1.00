// Netlify Edge Function for Authentication
// Handles user authentication and session management at the edge

export default async (request, context) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Handle authentication endpoints
  if (pathname.startsWith('/auth/')) {
    const endpoint = pathname.replace('/auth/', '');
    
    try {
      switch (endpoint) {
        case 'login':
          return await handleLogin(request, context);
        case 'logout':
          return await handleLogout(request, context);
        case 'verify':
          return await handleVerify(request, context);
        case 'refresh':
          return await handleRefresh(request, context);
        case 'profile':
          return await handleProfile(request, context);
        default:
          return new Response(JSON.stringify({ error: 'Unknown auth endpoint' }), {
            status: 404,
            headers: { 'content-type': 'application/json' }
          });
      }
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Authentication Error', 
        message: error.message 
      }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  }
  
  // Check authentication for protected routes
  if (isProtectedRoute(pathname)) {
    const authResult = await checkAuthentication(request, context);
    if (!authResult.authenticated) {
      return redirectToLogin(url);
    }
    
    // Add user context to the request
    const response = await context.next();
    return addUserContext(response, authResult.user);
  }
  
  // Pass through other requests
  return context.next();
};

async function handleLogin(request, context) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' }
    });
  }
  
  const body = await request.json();
  const { email, password, rememberMe } = body;
  
  // Mock authentication (in production, verify against your auth provider)
  const isValidUser = await validateCredentials(email, password);
  
  if (!isValidUser) {
    return new Response(JSON.stringify({ 
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    }), {
      status: 401,
      headers: { 'content-type': 'application/json' }
    });
  }
  
  // Generate session token
  const sessionToken = generateSessionToken();
  const expiresIn = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day
  const expiresAt = new Date(Date.now() + expiresIn);
  
  const user = {
    id: generateUserId(email),
    email,
    name: email.split('@')[0],
    preferences: {
      theme: 'dark',
      language: 'en',
      aiPersonality: 'professional'
    },
    permissions: ['basic', 'smart-home', 'code-lab'],
    lastLogin: new Date().toISOString(),
    location: {
      country: context.geo?.country?.code || 'US',
      city: context.geo?.city || 'Unknown'
    }
  };
  
  const response = new Response(JSON.stringify({
    success: true,
    user,
    token: sessionToken,
    expiresAt: expiresAt.toISOString()
  }), {
    headers: { 'content-type': 'application/json' }
  });
  
  // Set secure cookie
  response.headers.set('Set-Cookie', 
    `zeeky_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expiresAt.toUTCString()}`
  );
  
  return response;
}

async function handleLogout(request, context) {
  const response = new Response(JSON.stringify({ success: true, message: 'Logged out successfully' }), {
    headers: { 'content-type': 'application/json' }
  });
  
  // Clear session cookie
  response.headers.set('Set-Cookie', 
    'zeeky_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  );
  
  return response;
}

async function handleVerify(request, context) {
  const authResult = await checkAuthentication(request, context);
  
  return new Response(JSON.stringify({
    authenticated: authResult.authenticated,
    user: authResult.user || null
  }), {
    headers: { 'content-type': 'application/json' }
  });
}

async function handleRefresh(request, context) {
  const authResult = await checkAuthentication(request, context);
  
  if (!authResult.authenticated) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'content-type': 'application/json' }
    });
  }
  
  // Generate new session token
  const newSessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  
  const response = new Response(JSON.stringify({
    success: true,
    token: newSessionToken,
    expiresAt: expiresAt.toISOString(),
    user: authResult.user
  }), {
    headers: { 'content-type': 'application/json' }
  });
  
  // Set new session cookie
  response.headers.set('Set-Cookie', 
    `zeeky_session=${newSessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expiresAt.toUTCString()}`
  );
  
  return response;
}

async function handleProfile(request, context) {
  const authResult = await checkAuthentication(request, context);
  
  if (!authResult.authenticated) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'content-type': 'application/json' }
    });
  }
  
  if (request.method === 'GET') {
    return new Response(JSON.stringify({ user: authResult.user }), {
      headers: { 'content-type': 'application/json' }
    });
  }
  
  if (request.method === 'PUT') {
    const updates = await request.json();
    const updatedUser = { ...authResult.user, ...updates };
    
    return new Response(JSON.stringify({ 
      success: true, 
      user: updatedUser 
    }), {
      headers: { 'content-type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'content-type': 'application/json' }
  });
}

async function validateCredentials(email, password) {
  // Mock validation (in production, check against your database/auth provider)
  const validUsers = {
    'demo@zeeky.ai': 'demo123',
    'admin@zeeky.ai': 'admin123',
    'user@zeeky.ai': 'user123'
  };
  
  return validUsers[email] === password;
}

async function checkAuthentication(request, context) {
  const cookies = request.headers.get('cookie') || '';
  const sessionToken = extractSessionToken(cookies);
  
  if (!sessionToken) {
    return { authenticated: false };
  }
  
  // Mock session validation (in production, verify against your session store)
  const user = await validateSessionToken(sessionToken);
  
  if (!user) {
    return { authenticated: false };
  }
  
  return { authenticated: true, user };
}

function extractSessionToken(cookies) {
  const match = cookies.match(/zeeky_session=([^;]+)/);
  return match ? match[1] : null;
}

async function validateSessionToken(token) {
  // Mock session validation (in production, check against your session store)
  if (token.startsWith('sess_')) {
    return {
      id: 'user_123',
      email: 'demo@zeeky.ai',
      name: 'Demo User',
      preferences: {
        theme: 'dark',
        language: 'en',
        aiPersonality: 'professional'
      },
      permissions: ['basic', 'smart-home', 'code-lab'],
      lastActive: new Date().toISOString()
    };
  }
  
  return null;
}

function isProtectedRoute(pathname) {
  const protectedRoutes = [
    '/admin',
    '/profile',
    '/settings',
    '/api/private'
  ];
  
  return protectedRoutes.some(route => pathname.startsWith(route));
}

function redirectToLogin(url) {
  const loginUrl = new URL('/login', url.origin);
  loginUrl.searchParams.set('redirect', url.pathname);
  
  return new Response(null, {
    status: 302,
    headers: { 'Location': loginUrl.toString() }
  });
}

function addUserContext(response, user) {
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers),
      'x-user-id': user.id,
      'x-user-email': user.email,
      'x-user-permissions': user.permissions.join(',')
    }
  });
  
  return newResponse;
}

function generateSessionToken() {
  return 'sess_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
}

function generateUserId(email) {
  return 'user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substr(0, 10);
}

export const config = {
  path: ["/auth/*", "/admin/*", "/profile/*", "/settings/*"]
};

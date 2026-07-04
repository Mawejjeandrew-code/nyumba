import { createServerClient } from "@supabase/ssr";
 // server-only env vars - never prefixed with NEXT_PUBLIC_, never sent to the browser.
 const BACKEND_URL = process.env.NYUMBA_BACKEND_URL; 
 const ADMIN_SECRET = process.env.ADMIN_SECRET;

 export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed'});
    }

    // 1. Vwrify the caller is actually logged in as  the admin, using the same
    // supabase session cookie middleware.js already checks for /admin pages
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get: (key) => req.cookies[key],
                set: () => {},
                remove: () => {},
            },
        }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return res.status(401).json({ error: 'Not authenticated'});
    }
     // 2. Forward to the FastAPI backend, attaching the real admin secret here
     // server-side only, so it's never visible in browser devtools or bundle.
     const { path, method = 'GET', body} = req.body || {};
     if (!path) {
        return res.status(400).json({ error: ' Missing "path" in request body'});
     }
     if (!BACKEND_URL || !ADMIN_SECRET) {
        return res.status(500).json({ error: 'NYUMBA_BACKEND_URL or ADMIN_SECRET not configured' });

     }
    
     try {
        const backendRes = await fetch(`${BACKEND_URL}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ADMIN_SECRET}`,
            },
            body: method === 'GET' ?  undefined : JSON.stringify(body || {}),

        });

        const data = await backendRes.json();
        return res.status(backendRes.status).json(data);
     } catch (err) {
        return res.status(502).json({ error: 'Could not reach backend', detail: String (err)});
     }
 }
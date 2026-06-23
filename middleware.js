

import { createMiddlewareClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

  // Not logged in and trying to reach /admin → bounce to /login
  if (isAdminRoute && !session) {
    const loginUrl = new URL('/login', req.url);
    // remember where they were trying to go, so we can send them
    // back there after a successful login
    loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in and visiting /login → just send them to the dashboard
  if (req.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return res;
}

// Only run this middleware on these paths — leaves the public
// waitlist page completely untouched and fast
export const config = {
  matcher: ['/admin/:path*', '/login'],
};

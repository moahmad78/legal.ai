import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';

const isProtectedRoute = (pathname: string) => {
  return [
    '/dashboard',
    '/clients',
    '/matters',
    '/documents',
    '/reports',
    '/profile',
    '/settings',
    '/billing',
    '/search',
    '/app',
  ].some(route => pathname.startsWith(route));
};

export async function middleware(request: NextRequest) {
  const isSupabaseConfigured = !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  if (!isSupabaseConfigured) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (user) {
    if (pathname === '/chat' || pathname === '/sign-in' || pathname === '/sign-up') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  } else {
    if (isProtectedRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

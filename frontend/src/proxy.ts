import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// ✅ These routes cannot be accessed without login
const PRIVATE_ROUTES = ['/account', '/profile', '/orders', '/checkout', '/settings'];

// ✅ These routes cannot be accessed when already logged in
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('ecommerce_accessToken')?.value;

  const isPrivateRoute = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isPrivateRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

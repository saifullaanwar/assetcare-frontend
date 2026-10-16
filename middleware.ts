import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // 1. Jika belum login dan mencoba akses halaman terproteksi (selain login/register)
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Jika sudah login dan mencoba akses halaman login/register
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Proteksi seluruh rute kecuali static files, api, dan favicon
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
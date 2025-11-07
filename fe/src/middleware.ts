import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PREFIXES = ['/auth'];
const HEAD_OF_DEPARTMENT_PREFIX = '/head-of-department';

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const token =
    req.cookies.get('access_token')?.value
  const role =
    req.cookies.get('role')?.value ||
    '';

  if (token && isPublicPath(pathname)) {
    const url = nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (!token && !isPublicPath(pathname)) {
    const url = nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (
    pathname.startsWith(HEAD_OF_DEPARTMENT_PREFIX) &&
    role !== 'HEADOFDEPARTMENT' &&
    role !== 'HEAD_OF_DEPARTMENT'
  ) {
    const url = nextUrl.clone();
    url.pathname = '/forbidden';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|assets|api).*)',
  ],
};

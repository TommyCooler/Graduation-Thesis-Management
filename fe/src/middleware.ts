import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/oauth2/fail']
const HEAD_OF_DEPARTMENT_PREFIX = '/head-of-department'
const ADMIN_PREFIX = '/admin'

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname)
}

function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req
  const pathname = nextUrl.pathname
  const token = req.cookies.get('access_token')?.value

  // Nếu chưa có token mà vào private -> redirect login
  if (!token && !isPublicPath(pathname)) {
    const url = nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname + nextUrl.search)
    return NextResponse.redirect(url)
  }

  // Decode token để lấy role
  let role: string | undefined
  if (token) {
    const payload = decodeJwtPayload(token)
    role = payload?.role
  }

  // Phân quyền theo role
  if (pathname.startsWith(HEAD_OF_DEPARTMENT_PREFIX)) {
    if (role !== 'HEADOFDEPARTMENT' && role !== 'HEAD_OF_DEPARTMENT') {
      const url = nextUrl.clone()
      url.pathname = '/forbidden'
      return NextResponse.redirect(url)
    }
  } else if (pathname.startsWith(ADMIN_PREFIX)) {
    if (role !== 'ADMIN') {
      const url = nextUrl.clone()
      url.pathname = '/forbidden'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|assets|api).*)'],
}

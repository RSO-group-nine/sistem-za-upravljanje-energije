import { NextRequest, NextResponse } from 'next/server'
import verifyUser from '@/app/utils/jwtHandler'
 
// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard']
const publicRoutes = ['/login', '/register', '/']
 
export default async function middleware(req: NextRequest) {

  console.log("middleware called")
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)


  const token = sessionStorage.getItem('token');
 
  // 3. Decrypt the session from the cookie
  let session = null
  try {
    // 4. Decode the JWT token to get the user session
    if (token) {
      session = verifyUser(token)
    }
  } catch (error) {
    // Invalid or expired token
    console.error('Invalid or expired token:', error)
  }

  console.log('session:', session)
 
  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
 
  // 5. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    session &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }
 
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  api: {
    externalResolver: true,
  },
}
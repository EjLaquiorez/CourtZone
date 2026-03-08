import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout successful',
  })

  const expiredCookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    expires: new Date(0),
    path: '/',
  }

  response.cookies.set('refresh-token', '', expiredCookie)
  response.cookies.set('auth-token', '', expiredCookie)

  return response
}

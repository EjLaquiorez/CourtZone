import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  authCookieOptions,
  generateToken,
  verifyRefreshToken,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const refreshToken =
      body.refreshToken ||
      request.cookies.get('refresh-token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token is required' },
        { status: 401 }
      )
    }

    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    })

    const response = NextResponse.json({
      success: true,
      data: {
        accessToken,
        expiresIn: 7 * 24 * 60 * 60,
      },
      message: 'Token refreshed successfully',
    })

    response.cookies.set('auth-token', accessToken, {
      ...authCookieOptions,
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

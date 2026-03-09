import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isPrismaInitializationError } from '@/lib/db'
import {
  authCookieOptions,
  generateRefreshToken,
  generateToken,
  userToAuthUser,
  validateEmail,
  verifyPassword,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate tokens
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    })

    const refreshToken = generateRefreshToken(user.id)

    // Convert user to safe format
    const authUser = userToAuthUser(user)

    // Set HTTP-only cookie for refresh token
    const response = NextResponse.json({
      success: true,
      data: {
        user: authUser,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
        }
      },
      message: 'Login successful'
    })

    // Set secure cookie
    response.cookies.set('refresh-token', refreshToken, {
      ...authCookieOptions,
      maxAge: 30 * 24 * 60 * 60
    })
    response.cookies.set('auth-token', accessToken, {
      ...authCookieOptions,
      maxAge: 7 * 24 * 60 * 60
    })

    return response

  } catch (error) {
    console.error('Login error:', error)

    if (isPrismaInitializationError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Database client is not ready. Run "npm run db:generate" and restart the dev server.',
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

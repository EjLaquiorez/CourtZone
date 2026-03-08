import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken, generateRefreshToken, validateEmail, validatePassword, validateUsername, userToAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password, position, skillLevel } = body

    // Validate required fields
    if (!email || !username || !password) {
      return NextResponse.json(
        { success: false, message: 'Email, username, and password are required' },
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

    // Validate username
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.isValid) {
      return NextResponse.json(
        { success: false, message: usernameValidation.errors[0] },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.errors[0] },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username }
        ]
      }
    })

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username'
      return NextResponse.json(
        { success: false, message: `A user with this ${field} already exists` },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Validate skill level
    const validSkillLevel = skillLevel && skillLevel >= 1 && skillLevel <= 10 ? skillLevel : 5

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        position: position || null,
        skillLevel: validSkillLevel,
        rating: 1000, // Default starting rating
        isVerified: false
      }
    })

    // Generate tokens
    const accessToken = generateToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username
    })

    const refreshToken = generateRefreshToken(newUser.id)

    // Convert user to safe format
    const authUser = userToAuthUser(newUser)

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
      message: 'Registration successful'
    })

    // Set secure cookie
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })

    return response

  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, message: 'Email or username already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

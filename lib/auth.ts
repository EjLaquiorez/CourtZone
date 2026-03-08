import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { User } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Ensure JWT_SECRET is a string
if (!JWT_SECRET || typeof JWT_SECRET !== 'string') {
  throw new Error('JWT_SECRET must be defined as a string')
}

export interface JWTPayload {
  userId: string
  email: string
  username: string
  iat?: number
  exp?: number
}

export interface AuthUser {
  id: string
  email: string
  username: string
  avatar: string | null
  position: string | null
  skillLevel: number
  rating: number
  isVerified: boolean
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// JWT token management
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Extract user from request
export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  try {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization')
    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    // Fallback to cookies if no Authorization header
    if (!token) {
      token = request.cookies.get('auth-token')?.value || null
    }

    if (!token) {
      return null
    }

    return verifyToken(token)
  } catch (error) {
    console.error('Error extracting user from request:', error)
    return null
  }
}

// Validate password strength
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate username
export function validateUsername(username: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long')
  }

  if (username.length > 20) {
    errors.push('Username must be no more than 20 characters long')
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Convert Prisma User to AuthUser
export function userToAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    position: user.position,
    skillLevel: user.skillLevel,
    rating: user.rating,
    isVerified: user.isVerified
  }
}

// Generate refresh token
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' })
}

// Verify refresh token
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.type === 'refresh' && decoded.userId) {
      return { userId: decoded.userId }
    }
    return null
  } catch (error) {
    console.error('Refresh token verification failed:', error)
    return null
  }
}

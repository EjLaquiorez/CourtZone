import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const tokenUser = await getUserFromRequest(request)

    if (!tokenUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        position: true,
        skillLevel: true,
        rating: true,
        latitude: true,
        longitude: true,
        city: true,
        maxDistance: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        position: user.position,
        skillLevel: user.skillLevel,
        rating: user.rating,
        latitude: user.latitude,
        longitude: user.longitude,
        city: user.city,
        maxDistance: user.maxDistance,
        isVerified: user.isVerified,
        profileComplete: Boolean(user.position && user.city && user.maxDistance > 0),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      message: 'User retrieved successfully'
    })

  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

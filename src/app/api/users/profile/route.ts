import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest, validateUsername } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile with additional data
    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
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
        updatedAt: true,
        _count: {
          select: {
            captainTeams: true,
            teamMemberships: true,
            organizedGames: true,
            gameParticipants: true,
            gameStats: true
          }
        }
      }
    })

    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Get recent activity
    const recentGames = await prisma.gameParticipant.findMany({
      where: { userId: user.userId },
      include: {
        game: {
          include: {
            court: {
              select: {
                id: true,
                name: true,
                address: true
              }
            },
            hostTeam: {
              select: {
                id: true,
                name: true
              }
            },
            opponentTeam: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' },
      take: 5
    })

    // Get team memberships
    const teamMemberships = await prisma.teamMember.findMany({
      where: { userId: user.userId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            rating: true,
            gamesPlayed: true,
            wins: true
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    const profileData = {
      ...userProfile,
      stats: {
        teamsJoined: userProfile._count.teamMemberships,
        teamsCaptained: userProfile._count.captainTeams,
        gamesOrganized: userProfile._count.organizedGames,
        gamesPlayed: userProfile._count.gameParticipants,
        totalStats: userProfile._count.gameStats
      },
      recentGames: recentGames.map(pg => pg.game),
      teams: teamMemberships.map(tm => ({
        ...tm.team,
        role: tm.role,
        position: tm.position,
        isStarter: tm.isStarter,
        joinedAt: tm.joinedAt
      }))
    }

    return NextResponse.json({
      success: true,
      data: profileData,
      message: 'Profile retrieved successfully'
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      username,
      position,
      skillLevel,
      latitude,
      longitude,
      city,
      maxDistance,
      avatar
    } = body

    // Validate username if provided
    if (username) {
      const usernameValidation = validateUsername(username)
      if (!usernameValidation.isValid) {
        return NextResponse.json(
          { success: false, message: usernameValidation.errors[0] },
          { status: 400 }
        )
      }

      // Check if username is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: user.userId }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Username is already taken' },
          { status: 409 }
        )
      }
    }

    // Validate skill level
    if (skillLevel !== undefined && (skillLevel < 1 || skillLevel > 10)) {
      return NextResponse.json(
        { success: false, message: 'Skill level must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Validate coordinates
    if (latitude !== undefined && longitude !== undefined) {
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return NextResponse.json(
          { success: false, message: 'Invalid coordinates' },
          { status: 400 }
        )
      }
    }

    // Validate max distance
    if (maxDistance !== undefined && (maxDistance < 1 || maxDistance > 100)) {
      return NextResponse.json(
        { success: false, message: 'Max distance must be between 1 and 100 miles' },
        { status: 400 }
      )
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(username && { username }),
        ...(position !== undefined && { position }),
        ...(skillLevel !== undefined && { skillLevel: parseInt(skillLevel) }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(city !== undefined && { city }),
        ...(maxDistance !== undefined && { maxDistance: parseInt(maxDistance) }),
        ...(avatar !== undefined && { avatar })
      },
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

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

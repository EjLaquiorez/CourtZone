import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const gameType = searchParams.get('gameType')
    const skillLevel = searchParams.get('skillLevel')
    const courtId = searchParams.get('courtId')

    // Build where clause
    const where: any = {
      isPrivate: false // Only show public games by default
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    if (gameType) {
      where.gameType = gameType.toUpperCase()
    }

    if (skillLevel) {
      const level = parseInt(skillLevel)
      where.AND = [
        { skillLevelMin: { lte: level } },
        { skillLevelMax: { gte: level } }
      ]
    }

    if (courtId) {
      where.courtId = courtId
    }

    // Get games with pagination
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              username: true,
              avatar: true,
              rating: true,
              skillLevel: true,
              isVerified: true
            }
          },
          court: {
            select: {
              id: true,
              name: true,
              address: true,
              courtType: true,
              latitude: true,
              longitude: true,
              rating: true
            }
          },
          hostTeam: {
            select: {
              id: true,
              name: true,
              rating: true,
              logoUrl: true
            }
          },
          opponentTeam: {
            select: {
              id: true,
              name: true,
              rating: true,
              logoUrl: true
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  rating: true,
                  skillLevel: true
                }
              }
            }
          },
          _count: {
            select: {
              participants: true
            }
          }
        },
        orderBy: [
          { scheduledAt: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.game.count({ where })
    ])

    // Transform data to include participant count
    const transformedGames = games.map(game => ({
      ...game,
      participantCount: game._count.participants,
      spotsLeft: game.maxPlayers - game._count.participants
    }))

    return NextResponse.json({
      success: true,
      data: {
        games: transformedGames,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: 'Games retrieved successfully'
    })

  } catch (error) {
    console.error('Get games error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      title,
      description,
      gameType,
      courtId,
      scheduledAt,
      duration,
      maxPlayers,
      skillLevel,
      isPrivate,
      hostTeamId
    } = body

    // Validate required fields
    if (!title || !courtId || !scheduledAt || !maxPlayers) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate scheduled time is in the future
    const gameTime = new Date(scheduledAt)
    if (gameTime <= new Date()) {
      return NextResponse.json(
        { success: false, message: 'Game must be scheduled for a future time' },
        { status: 400 }
      )
    }

    // Validate court exists
    const court = await prisma.court.findUnique({
      where: { id: courtId }
    })

    if (!court) {
      return NextResponse.json(
        { success: false, message: 'Court not found' },
        { status: 404 }
      )
    }

    // If hostTeamId is provided, validate user is captain
    if (hostTeamId) {
      const team = await prisma.team.findUnique({
        where: { id: hostTeamId },
        select: { captainId: true }
      })

      if (!team || team.captainId !== user.userId) {
        return NextResponse.json(
          { success: false, message: 'You can only create games for teams you captain' },
          { status: 403 }
        )
      }
    }

    // Create game
    const game = await prisma.game.create({
      data: {
        title,
        description: description || null,
        gameType: gameType?.toUpperCase() || 'PICKUP',
        courtId,
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration) || 120,
        maxPlayers: parseInt(maxPlayers),
        skillLevelMin: skillLevel?.min || 1,
        skillLevelMax: skillLevel?.max || 10,
        isPrivate: isPrivate || false,
        organizerId: user.userId,
        hostTeamId: hostTeamId || null
      },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            avatar: true,
            rating: true,
            skillLevel: true,
            isVerified: true
          }
        },
        court: {
          select: {
            id: true,
            name: true,
            address: true,
            courtType: true,
            latitude: true,
            longitude: true
          }
        },
        hostTeam: {
          select: {
            id: true,
            name: true,
            rating: true,
            logoUrl: true
          }
        }
      }
    })

    // Auto-join the organizer to the game
    await prisma.gameParticipant.create({
      data: {
        gameId: game.id,
        userId: user.userId
      }
    })

    return NextResponse.json({
      success: true,
      data: game,
      message: 'Game created successfully'
    })

  } catch (error) {
    console.error('Create game error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

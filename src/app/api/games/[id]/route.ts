import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id

    // Get game with all related data
    const game = await prisma.game.findUnique({
      where: { id: gameId },
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
            rating: true,
            amenities: true,
            photos: true
          }
        },
        hostTeam: {
          include: {
            captain: {
              select: {
                id: true,
                username: true,
                avatar: true,
                rating: true,
                skillLevel: true
              }
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                    rating: true,
                    skillLevel: true,
                    position: true
                  }
                }
              }
            }
          }
        },
        opponentTeam: {
          include: {
            captain: {
              select: {
                id: true,
                username: true,
                avatar: true,
                rating: true,
                skillLevel: true
              }
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                    rating: true,
                    skillLevel: true,
                    position: true
                  }
                }
              }
            }
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
                skillLevel: true,
                position: true
              }
            }
          }
        },
        waitlist: {
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
          },
          orderBy: {
            position: 'asc'
          }
        },
        gameStats: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            participants: true,
            waitlist: true
          }
        }
      }
    })

    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      )
    }

    // Transform data to include additional computed fields
    const transformedGame = {
      ...game,
      participantCount: game._count.participants,
      waitlistCount: game._count.waitlist,
      spotsLeft: game.maxPlayers - game._count.participants,
      isFull: game._count.participants >= game.maxPlayers
    }

    return NextResponse.json({
      success: true,
      data: transformedGame,
      message: 'Game retrieved successfully'
    })

  } catch (error) {
    console.error('Get game error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const gameId = params.id
    const body = await request.json()

    // Check if game exists and user has permission to edit
    const existingGame = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        organizerId: true,
        status: true,
        hostTeam: {
          select: {
            captainId: true
          }
        }
      }
    })

    if (!existingGame) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      )
    }

    // Check permissions - only organizer or host team captain can edit
    const canEdit = existingGame.organizerId === user.userId ||
                   existingGame.hostTeam?.captainId === user.userId

    if (!canEdit) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to edit this game' },
        { status: 403 }
      )
    }

    // Cannot edit completed or cancelled games
    if (existingGame.status === 'COMPLETED' || existingGame.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, message: 'Cannot edit completed or cancelled games' },
        { status: 400 }
      )
    }

    const {
      title,
      description,
      scheduledAt,
      duration,
      maxPlayers,
      skillLevelMin,
      skillLevelMax,
      isPrivate
    } = body

    // Validate scheduled time if provided
    if (scheduledAt) {
      const gameTime = new Date(scheduledAt)
      if (gameTime <= new Date()) {
        return NextResponse.json(
          { success: false, message: 'Game must be scheduled for a future time' },
          { status: 400 }
        )
      }
    }

    // Update game
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(duration && { duration: parseInt(duration) }),
        ...(maxPlayers && { maxPlayers: parseInt(maxPlayers) }),
        ...(skillLevelMin !== undefined && { skillLevelMin: parseInt(skillLevelMin) }),
        ...(skillLevelMax !== undefined && { skillLevelMax: parseInt(skillLevelMax) }),
        ...(isPrivate !== undefined && { isPrivate })
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

    return NextResponse.json({
      success: true,
      data: updatedGame,
      message: 'Game updated successfully'
    })

  } catch (error) {
    console.error('Update game error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const gameId = params.id

    // Check if game exists and user has permission to delete
    const existingGame = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        organizerId: true,
        status: true,
        scheduledAt: true,
        hostTeam: {
          select: {
            captainId: true
          }
        }
      }
    })

    if (!existingGame) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      )
    }

    // Check permissions - only organizer or host team captain can delete
    const canDelete = existingGame.organizerId === user.userId ||
                     existingGame.hostTeam?.captainId === user.userId

    if (!canDelete) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to delete this game' },
        { status: 403 }
      )
    }

    // Cannot delete completed games
    if (existingGame.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete completed games' },
        { status: 400 }
      )
    }

    // Cannot delete games that have already started
    if (existingGame.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete games that are in progress' },
        { status: 400 }
      )
    }

    // Delete game (this will cascade delete participants, waitlist, etc.)
    await prisma.game.delete({
      where: { id: gameId }
    })

    return NextResponse.json({
      success: true,
      message: 'Game deleted successfully'
    })

  } catch (error) {
    console.error('Delete game error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

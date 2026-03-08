import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
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

    const teamId = params.id

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        captain: {
          select: {
            id: true,
            username: true,
            avatar: true,
            rating: true,
            skillLevel: true,
            isVerified: true,
            position: true
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
                position: true,
                isVerified: true
              }
            }
          },
          orderBy: [
            { role: 'asc' },
            { isStarter: 'desc' },
            { joinedAt: 'asc' }
          ]
        },
        hostGames: {
          include: {
            court: {
              select: {
                id: true,
                name: true,
                address: true
              }
            },
            opponentTeam: {
              select: {
                id: true,
                name: true,
                rating: true
              }
            }
          },
          orderBy: { scheduledAt: 'desc' },
          take: 5
        },
        opponentGames: {
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
                name: true,
                rating: true
              }
            }
          },
          orderBy: { scheduledAt: 'desc' },
          take: 5
        }
      }
    })

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    // Check if team is private and user is not a member
    if (!team.isPublic) {
      const isMember = team.members.some(member => member.userId === user.userId)
      if (!isMember) {
        return NextResponse.json(
          { success: false, message: 'Access denied to private team' },
          { status: 403 }
        )
      }
    }

    // Combine and sort all games
    const allGames = [...team.hostGames, ...team.opponentGames]
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      .slice(0, 10)

    const teamWithGames = {
      ...team,
      memberCount: team.members.length,
      recentGames: allGames
    }

    return NextResponse.json({
      success: true,
      data: teamWithGames,
      message: 'Team retrieved successfully'
    })

  } catch (error) {
    console.error('Get team error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const teamId = params.id
    const body = await request.json()

    // Check if user is team captain
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { captainId: true }
    })

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    if (team.captainId !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Only team captain can edit team' },
        { status: 403 }
      )
    }

    // Update team
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.maxSize && { maxSize: parseInt(body.maxSize) }),
        ...(body.minSkillLevel !== undefined && { minSkillLevel: parseInt(body.minSkillLevel) }),
        ...(body.maxSkillLevel !== undefined && { maxSkillLevel: parseInt(body.maxSkillLevel) }),
        ...(body.isPublic !== undefined && { isPublic: body.isPublic })
      },
      include: {
        captain: {
          select: {
            id: true,
            username: true,
            avatar: true,
            rating: true,
            skillLevel: true,
            isVerified: true
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
    })

    return NextResponse.json({
      success: true,
      data: updatedTeam,
      message: 'Team updated successfully'
    })

  } catch (error) {
    console.error('Update team error:', error)
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

    const teamId = params.id

    // Check if user is team captain
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { captainId: true, name: true }
    })

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    if (team.captainId !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Only team captain can delete team' },
        { status: 403 }
      )
    }

    // Delete team (cascade will handle members)
    await prisma.team.delete({
      where: { id: teamId }
    })

    return NextResponse.json({
      success: true,
      data: null,
      message: `Team "${team.name}" deleted successfully`
    })

  } catch (error) {
    console.error('Delete team error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

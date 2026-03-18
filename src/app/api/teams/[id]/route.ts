import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { logTeamActivity, mapRoleToClient } from '../_utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: teamId } = await params

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
          where: {
            status: 'ACTIVE',
          },
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
          orderBy: [{ role: 'asc' }, { isStarter: 'desc' }, { joinedAt: 'asc' }]
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
      members: team.members.map((member) => ({
        ...member,
        role: mapRoleToClient(member.role as 'CAPTAIN' | 'CO_CAPTAIN' | 'MEMBER'),
      })),
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: teamId } = await params
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
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
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

    await logTeamActivity({
      teamId,
      userId: user.userId,
      type: 'TEAM_UPDATED',
      description: 'Team settings were updated',
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedTeam,
        members: updatedTeam.members.map((member) => ({
          ...member,
          role: mapRoleToClient(member.role as 'CAPTAIN' | 'CO_CAPTAIN' | 'MEMBER'),
        })),
      },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: teamId } = await params

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

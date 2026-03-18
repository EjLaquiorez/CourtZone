import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { mapActivityTypeToClient, mapInviteStatusToClient, mapRoleToClient } from '../../_utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getUserFromRequest(request)
    if (!authUser) {
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
            email: true,
            rating: true,
            skillLevel: true,
            position: true,
            city: true,
            maxDistance: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                email: true,
                rating: true,
                skillLevel: true,
                position: true,
                city: true,
                maxDistance: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
        },
      },
    })

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    const membership = team.members.find((member) => member.userId === authUser.userId)
    const isCaptain = team.captainId === authUser.userId
    const isMember = Boolean(membership) || isCaptain

    if (!team.isPublic && !isMember) {
      return NextResponse.json(
        { success: false, message: 'Access denied to private team' },
        { status: 403 }
      )
    }

    if (!isMember) {
      return NextResponse.json(
        { success: false, message: 'You are not a member of this team' },
        { status: 403 }
      )
    }

    const role = isCaptain ? 'captain' : mapRoleToClient(membership!.role as 'CAPTAIN' | 'CO_CAPTAIN' | 'MEMBER')

    const [upcomingGames, recentResults, activity, pendingInvites] = await Promise.all([
      prisma.game.findMany({
        where: {
          OR: [{ hostTeamId: teamId }, { opponentTeamId: teamId }],
          status: 'SCHEDULED',
        },
        include: {
          court: true,
          organizer: true,
          hostTeam: true,
          opponentTeam: true,
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),
      prisma.game.findMany({
        where: {
          OR: [{ hostTeamId: teamId }, { opponentTeamId: teamId }],
          status: 'COMPLETED',
        },
        include: {
          court: true,
          organizer: true,
          hostTeam: true,
          opponentTeam: true,
        },
        orderBy: { scheduledAt: 'desc' },
        take: 8,
      }),
      prisma.teamActivity.findMany({
        where: { teamId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      role === 'captain' || role === 'co_captain'
        ? prisma.teamInvite.findMany({
            where: {
              teamId,
              status: 'PENDING',
            },
            include: {
              invitedUser: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  rating: true,
                  skillLevel: true,
                },
              },
              invitedBy: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
          })
        : Promise.resolve([]),
    ])

    const activeMembers = team.members.filter((member) => member.status === 'ACTIVE')
    const averageSkillLevel = activeMembers.length
      ? Number(
          (
            activeMembers.reduce((sum, member) => sum + (member.user?.skillLevel ?? 0), 0) /
            activeMembers.length
          ).toFixed(1)
        )
      : 0

    const completedGamesForTeam = recentResults.filter(
      (game) => typeof game.hostScore === 'number' && typeof game.opponentScore === 'number'
    )
    const scoredTotal = completedGamesForTeam.reduce((sum, game) => {
      if (game.hostTeamId === teamId) return sum + (game.hostScore ?? 0)
      return sum + (game.opponentScore ?? 0)
    }, 0)
    const allowedTotal = completedGamesForTeam.reduce((sum, game) => {
      if (game.hostTeamId === teamId) return sum + (game.opponentScore ?? 0)
      return sum + (game.hostScore ?? 0)
    }, 0)

    const averagePointsScored = completedGamesForTeam.length
      ? Number((scoredTotal / completedGamesForTeam.length).toFixed(1))
      : 0
    const averagePointsAllowed = completedGamesForTeam.length
      ? Number((allowedTotal / completedGamesForTeam.length).toFixed(1))
      : 0

    const teamPayload = {
      ...team,
      members: team.members.map((member) => ({
        ...member,
        role: mapRoleToClient(member.role as 'CAPTAIN' | 'CO_CAPTAIN' | 'MEMBER'),
        status: member.status.toLowerCase(),
      })),
      memberCount: activeMembers.length,
    }

    return NextResponse.json({
      success: true,
      data: {
        team: teamPayload,
        role,
        stats: {
          currentMembers: activeMembers.length,
          averageSkillLevel,
          teamRating: team.rating,
          winRecord: `${team.wins}-${Math.max(team.gamesPlayed - team.wins, 0)}`,
          winRate: team.gamesPlayed ? Number(((team.wins / team.gamesPlayed) * 100).toFixed(1)) : 0,
          totalGamesPlayed: team.gamesPlayed,
          averagePointsScored,
          averagePointsAllowed,
        },
        upcomingGames,
        recentResults,
        activity: activity.map((item) => ({
          ...item,
          type: mapActivityTypeToClient(item.type),
        })),
        pendingInvites: pendingInvites.map((invite) => ({
          ...invite,
          status: mapInviteStatusToClient(invite.status),
        })),
      },
      message: 'Team hub data retrieved successfully',
    })
  } catch (error) {
    console.error('Get team hub error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

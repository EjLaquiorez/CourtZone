import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { logTeamActivity, mapRoleToClient } from '../../_utils'

const POSITIONS = new Set(['PG', 'SG', 'SF', 'PF', 'C'])

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
                isVerified: true,
              },
            },
          },
          orderBy: [{ isStarter: 'desc' }, { joinedAt: 'asc' }],
        },
      },
    })

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    const isMember =
      team.captainId === authUser.userId ||
      team.members.some((member) => member.userId === authUser.userId)

    if (!isMember) {
      return NextResponse.json(
        { success: false, message: 'Only team members can view lineup' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: team.members.map((member) => ({
        ...member,
        role: mapRoleToClient(member.role as 'CAPTAIN' | 'CO_CAPTAIN' | 'MEMBER'),
      })),
      message: 'Team lineup retrieved successfully',
    })
  } catch (error) {
    console.error('Get team lineup error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const body = await request.json()
    const lineup = Array.isArray(body.lineup) ? body.lineup : []

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    })

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    const membership = team.members.find((member) => member.userId === authUser.userId)
    const role = team.captainId === authUser.userId
      ? 'captain'
      : membership
        ? mapRoleToClient(membership.role as 'CAPTAIN' | 'CO_CAPTAIN' | 'MEMBER')
        : null

    if (!role || (role !== 'captain' && role !== 'co_captain')) {
      return NextResponse.json(
        { success: false, message: 'Only team leaders can update lineup' },
        { status: 403 }
      )
    }

    const memberIds = new Set(team.members.map((member) => member.id))
    const starterPositions = new Set<string>()

    for (const entry of lineup) {
      if (!entry?.memberId || !memberIds.has(entry.memberId)) {
        return NextResponse.json(
          { success: false, message: 'Lineup contains invalid member' },
          { status: 400 }
        )
      }
      if (!POSITIONS.has(entry.position)) {
        return NextResponse.json(
          { success: false, message: 'Lineup contains invalid position' },
          { status: 400 }
        )
      }
      if (entry.isStarter) {
        if (starterPositions.has(entry.position)) {
          return NextResponse.json(
            { success: false, message: 'Duplicate starter positions are not allowed' },
            { status: 400 }
          )
        }
        starterPositions.add(entry.position)
      }
    }

    await prisma.$transaction(
      lineup.map((entry: { memberId: string; position: string; isStarter: boolean }) =>
        prisma.teamMember.update({
          where: { id: entry.memberId },
          data: {
            position: entry.position as 'PG' | 'SG' | 'SF' | 'PF' | 'C',
            isStarter: Boolean(entry.isStarter),
          },
        })
      )
    )

    const updatedMembers = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            rating: true,
            skillLevel: true,
            position: true,
            isVerified: true,
          },
        },
      },
      orderBy: [{ isStarter: 'desc' }, { joinedAt: 'asc' }],
    })

    await logTeamActivity({
      teamId,
      userId: authUser.userId,
      type: 'TEAM_UPDATED',
      description: 'Team lineup was updated',
    })

    return NextResponse.json({
      success: true,
      data: updatedMembers.map((member) => ({
        ...member,
        role: mapRoleToClient(member.role as 'CAPTAIN' | 'CO_CAPTAIN' | 'MEMBER'),
      })),
      message: 'Lineup saved successfully',
    })
  } catch (error) {
    console.error('Update team lineup error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

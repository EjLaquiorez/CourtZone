import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { logTeamActivity, mapRoleToClient, mapRoleToPrisma } from '../../../_utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const authUser = await getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: teamId, memberId } = await params
    const body = await request.json()
    const requestedRoleInput = String(body.role || '').toLowerCase()

    if (!['co_captain', 'member'].includes(requestedRoleInput)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      )
    }
    const requestedRole = requestedRoleInput as 'co_captain' | 'member'

    const [team, targetMember] = await Promise.all([
      prisma.team.findUnique({
        where: { id: teamId },
        include: { members: true },
      }),
      prisma.teamMember.findUnique({
        where: { id: memberId },
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
      }),
    ])

    if (!team || !targetMember || targetMember.teamId !== teamId) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      )
    }

    if (team.captainId !== authUser.userId) {
      return NextResponse.json(
        { success: false, message: 'Only captain can change member roles' },
        { status: 403 }
      )
    }

    if (targetMember.userId === team.captainId) {
      return NextResponse.json(
        { success: false, message: 'Use transfer captain endpoint to change captain role' },
        { status: 400 }
      )
    }

    const updated = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role: mapRoleToPrisma(requestedRole) },
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
    })

    await logTeamActivity({
      teamId,
      userId: authUser.userId,
      type: 'MEMBER_PROMOTED',
      description: `${updated.user?.username ?? 'Member'} is now ${requestedRole.replace('_', ' ')}`,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        role: mapRoleToClient(updated.role as 'CAPTAIN' | 'CO_CAPTAIN' | 'MEMBER'),
      },
      message: 'Member role updated',
    })
  } catch (error) {
    console.error('Update member role error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const authUser = await getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: teamId, memberId } = await params

    const [team, targetMember] = await Promise.all([
      prisma.team.findUnique({ where: { id: teamId } }),
      prisma.teamMember.findUnique({
        where: { id: memberId },
        include: { user: { select: { username: true } } },
      }),
    ])

    if (!team || !targetMember || targetMember.teamId !== teamId) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      )
    }

    if (team.captainId !== authUser.userId) {
      return NextResponse.json(
        { success: false, message: 'Only captain can remove members' },
        { status: 403 }
      )
    }

    if (targetMember.userId === team.captainId) {
      return NextResponse.json(
        { success: false, message: 'Captain cannot remove self' },
        { status: 400 }
      )
    }

    await prisma.teamMember.delete({ where: { id: memberId } })

    await logTeamActivity({
      teamId,
      userId: authUser.userId,
      type: 'MEMBER_REMOVED',
      description: `${targetMember.user?.username ?? 'A member'} was removed from the team`,
    })

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Member removed successfully',
    })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

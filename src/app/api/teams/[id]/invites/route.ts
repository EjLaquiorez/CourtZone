import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createInviteCode, logTeamActivity, mapInviteStatusToClient, mapRoleToClient } from '../../_utils'

const canManageInvites = (role: 'captain' | 'co_captain' | 'member') =>
  role === 'captain' || role === 'co_captain'

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
        members: true,
      },
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

    if (!role || !canManageInvites(role)) {
      return NextResponse.json(
        { success: false, message: 'Only team leaders can view invites' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const invites = await prisma.teamInvite.findMany({
      where: {
        teamId,
        ...(status ? { status: status.toUpperCase() as 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'DECLINED' | 'CANCELLED' } : {}),
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
    })

    return NextResponse.json({
      success: true,
      data: invites.map((invite) => ({
        ...invite,
        status: mapInviteStatusToClient(invite.status),
      })),
      message: 'Invites retrieved successfully',
    })
  } catch (error) {
    console.error('Get invites error:', error)
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
    const { invitedUserId, username } = body as { invitedUserId?: string; username?: string }

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

    if (!role || !canManageInvites(role)) {
      return NextResponse.json(
        { success: false, message: 'Only team leaders can send invites' },
        { status: 403 }
      )
    }

    const targetUser = invitedUserId
      ? await prisma.user.findUnique({ where: { id: invitedUserId } })
      : username
        ? await prisma.user.findUnique({ where: { username } })
        : null

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'Target user not found' },
        { status: 404 }
      )
    }

    if (team.members.some((member) => member.userId === targetUser.id)) {
      return NextResponse.json(
        { success: false, message: 'User is already a team member' },
        { status: 409 }
      )
    }

    const existingPending = await prisma.teamInvite.findFirst({
      where: {
        teamId,
        invitedUserId: targetUser.id,
        status: 'PENDING',
      },
    })

    if (existingPending) {
      return NextResponse.json(
        { success: false, message: 'Pending invite already exists for this user' },
        { status: 409 }
      )
    }

    const invite = await prisma.teamInvite.create({
      data: {
        teamId,
        invitedUserId: targetUser.id,
        invitedById: authUser.userId,
        inviteCode: createInviteCode(teamId, targetUser.id),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
    })

    await logTeamActivity({
      teamId,
      userId: authUser.userId,
      type: 'INVITE_SENT',
      description: `${targetUser.username} was invited to join the team`,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...invite,
        status: mapInviteStatusToClient(invite.status),
      },
      message: 'Invite sent successfully',
    })
  } catch (error) {
    console.error('Send invite error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

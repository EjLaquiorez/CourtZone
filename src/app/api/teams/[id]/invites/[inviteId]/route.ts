import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { logTeamActivity, mapInviteStatusToClient, mapRoleToClient } from '../../../_utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; inviteId: string }> }
) {
  try {
    const authUser = await getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: teamId, inviteId } = await params
    const body = await request.json()
    const requestedStatus = String(body.status || '').toLowerCase()

    if (!['accepted', 'declined', 'cancelled', 'expired'].includes(requestedStatus)) {
      return NextResponse.json(
        { success: false, message: 'Invalid invite status' },
        { status: 400 }
      )
    }

    const [team, invite] = await Promise.all([
      prisma.team.findUnique({
        where: { id: teamId },
        include: { members: true },
      }),
      prisma.teamInvite.findUnique({
        where: { id: inviteId },
        include: {
          invitedUser: true,
          invitedBy: true,
        },
      }),
    ])

    if (!team || !invite || invite.teamId !== teamId) {
      return NextResponse.json(
        { success: false, message: 'Invite not found' },
        { status: 404 }
      )
    }

    const membership = team.members.find((member) => member.userId === authUser.userId)
    const role = team.captainId === authUser.userId
      ? 'captain'
      : membership
        ? mapRoleToClient(membership.role as 'CAPTAIN' | 'CO_CAPTAIN' | 'MEMBER')
        : null

    const isLeader = role === 'captain' || role === 'co_captain'
    const isInvitee = invite.invitedUserId === authUser.userId

    if ((requestedStatus === 'accepted' || requestedStatus === 'declined') && !isInvitee) {
      return NextResponse.json(
        { success: false, message: 'Only invited user can accept or decline' },
        { status: 403 }
      )
    }

    if ((requestedStatus === 'cancelled' || requestedStatus === 'expired') && !isLeader) {
      return NextResponse.json(
        { success: false, message: 'Only team leaders can cancel or expire invites' },
        { status: 403 }
      )
    }

    if (invite.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: 'Invite is no longer pending' },
        { status: 409 }
      )
    }

    const nextStatus = requestedStatus.toUpperCase() as 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED'

    if (nextStatus === 'ACCEPTED') {
      const existingMembership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: invite.invitedUserId,
          },
        },
      })

      if (!existingMembership) {
        if (team.members.filter((member) => member.status === 'ACTIVE').length >= team.maxSize) {
          return NextResponse.json(
            { success: false, message: 'Team is full' },
            { status: 409 }
          )
        }

        await prisma.teamMember.create({
          data: {
            teamId,
            userId: invite.invitedUserId,
            role: 'MEMBER',
            status: 'ACTIVE',
            isStarter: false,
          },
        })
      }

      await logTeamActivity({
        teamId,
        userId: invite.invitedUserId,
        type: 'INVITE_ACCEPTED',
        description: `${invite.invitedUser.username} accepted the team invite`,
      })
    }

    if (nextStatus === 'DECLINED') {
      await logTeamActivity({
        teamId,
        userId: invite.invitedUserId,
        type: 'TEAM_UPDATED',
        description: `${invite.invitedUser.username} declined the team invite`,
      })
    }

    const updated = await prisma.teamInvite.update({
      where: { id: inviteId },
      data: { status: nextStatus },
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

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        status: mapInviteStatusToClient(updated.status),
      },
      message: 'Invite updated successfully',
    })
  } catch (error) {
    console.error('Update invite error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

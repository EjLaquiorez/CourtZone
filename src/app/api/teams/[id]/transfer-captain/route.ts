import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { logTeamActivity } from '../../_utils'

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
    const { newCaptainUserId } = body as { newCaptainUserId?: string }

    if (!newCaptainUserId) {
      return NextResponse.json(
        { success: false, message: 'newCaptainUserId is required' },
        { status: 400 }
      )
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    if (team.captainId !== authUser.userId) {
      return NextResponse.json(
        { success: false, message: 'Only current captain can transfer captaincy' },
        { status: 403 }
      )
    }

    const newCaptainMember = team.members.find((member) => member.userId === newCaptainUserId)
    const oldCaptainMember = team.members.find((member) => member.userId === team.captainId)

    if (!newCaptainMember) {
      return NextResponse.json(
        { success: false, message: 'New captain must be an active team member' },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.team.update({
        where: { id: teamId },
        data: {
          captainId: newCaptainUserId,
        },
      })

      await tx.teamMember.update({
        where: { id: newCaptainMember.id },
        data: { role: 'CAPTAIN' },
      })

      if (oldCaptainMember && oldCaptainMember.id !== newCaptainMember.id) {
        await tx.teamMember.update({
          where: { id: oldCaptainMember.id },
          data: { role: 'CO_CAPTAIN' },
        })
      }
    })

    await logTeamActivity({
      teamId,
      userId: authUser.userId,
      type: 'CAPTAIN_TRANSFERRED',
      description: `Captaincy transferred to ${newCaptainMember.user?.username ?? 'new captain'}`,
    })

    return NextResponse.json({
      success: true,
      data: { teamId, captainId: newCaptainUserId },
      message: 'Captain transferred successfully',
    })
  } catch (error) {
    console.error('Transfer captain error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

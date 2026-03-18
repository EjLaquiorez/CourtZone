import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { logTeamActivity } from '../../_utils'

export async function POST(
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

    // Get team details
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        captainId: true
      }
    })

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    // Check if user is the captain
    if (team.captainId === user.userId) {
      return NextResponse.json(
        { success: false, message: 'Team captain cannot leave the team. Transfer captaincy or delete the team instead.' },
        { status: 403 }
      )
    }

    // Check if user is a member
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: user.userId
        }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { success: false, message: 'You are not a member of this team' },
        { status: 404 }
      )
    }
    if (membership.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'You are not an active member of this team' },
        { status: 409 }
      )
    }

    // Mark user as left team
    await prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId: user.userId
        }
      },
      data: {
        status: 'LEFT',
        isStarter: false,
        role: 'MEMBER',
      },
    })

    await logTeamActivity({
      teamId,
      userId: user.userId,
      type: 'MEMBER_LEFT',
      description: 'A member left the team',
    })

    return NextResponse.json({
      success: true,
      data: null,
      message: `Successfully left ${team.name}`
    })

  } catch (error) {
    console.error('Leave team error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

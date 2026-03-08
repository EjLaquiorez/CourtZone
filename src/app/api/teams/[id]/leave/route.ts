import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(
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

    // Remove user from team
    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId: user.userId
        }
      }
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

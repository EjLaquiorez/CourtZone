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
      include: {
        members: true,
        captain: {
          select: {
            username: true
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    // Check if team is public
    if (!team.isPublic) {
      return NextResponse.json(
        { success: false, message: 'Cannot join private team without invitation' },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const existingMember = team.members.find(member => member.userId === user.userId)
    if (existingMember) {
      return NextResponse.json(
        { success: false, message: 'You are already a member of this team' },
        { status: 409 }
      )
    }

    // Check if team is full
    if (team.members.length >= team.maxSize) {
      return NextResponse.json(
        { success: false, message: 'Team is full' },
        { status: 409 }
      )
    }

    // Get user's skill level to check eligibility
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { skillLevel: true, username: true, position: true }
    })

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Check skill level requirements
    if (userData.skillLevel < team.minSkillLevel || userData.skillLevel > team.maxSkillLevel) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Your skill level (${userData.skillLevel}) doesn't meet team requirements (${team.minSkillLevel}-${team.maxSkillLevel})` 
        },
        { status: 403 }
      )
    }

    // Add user to team
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId: user.userId,
        role: 'MEMBER',
        position: userData.position,
        isStarter: false
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
        },
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: teamMember,
      message: `Successfully joined ${team.name}!`
    })

  } catch (error) {
    console.error('Join team error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

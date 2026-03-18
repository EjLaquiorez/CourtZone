import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

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

    const { id: userId } = await params
    if (authUser.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const requestedPage = parseInt(searchParams.get('page') || '1', 10)
    const requestedLimit = parseInt(searchParams.get('limit') || '10', 10)

    const page = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage
    const limit = Number.isNaN(requestedLimit) || requestedLimit < 1 ? 10 : requestedLimit

    const where = {
      members: {
        some: {
          userId
        }
      }
    }

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
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
          },
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.team.count({ where })
    ])

    const transformedTeams = teams
      .map((team) => {
        const activeMembers = team.members.filter((member) => (member as any).status ? (member as any).status === 'ACTIVE' : true)
        const activeMembershipForUser = activeMembers.some((member) => member.userId === userId)
        return {
          ...team,
          members: activeMembers,
          memberCount: activeMembers.length,
          _activeMembershipForUser: activeMembershipForUser,
        }
      })
      .filter((team) => team._activeMembershipForUser)
      .map(({ _activeMembershipForUser, ...team }) => team)

    return NextResponse.json({
      success: true,
      data: {
        data: transformedTeams,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: 'User teams retrieved successfully'
    })
  } catch (error) {
    console.error('Get user teams error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

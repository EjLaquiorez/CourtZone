import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { mapActivityTypeToClient } from '../../_utils'

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
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: { select: { userId: true } } },
    })

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    const isMember = team.members.some((m) => m.userId === authUser.userId) || team.captainId === authUser.userId
    if (!team.isPublic && !isMember) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      )
    }

    const [items, total] = await Promise.all([
      prisma.teamActivity.findMany({
        where: { teamId },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.teamActivity.count({ where: { teamId } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        data: items.map((item) => ({
          ...item,
          type: mapActivityTypeToClient(item.type),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      message: 'Team activity retrieved successfully',
    })
  } catch (error) {
    console.error('Get team activity error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

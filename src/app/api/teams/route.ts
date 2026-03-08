import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const skillLevel = searchParams.get('skillLevel')
    const isPublic = searchParams.get('isPublic')

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (skillLevel) {
      const level = parseInt(skillLevel)
      where.AND = [
        { minSkillLevel: { lte: level } },
        { maxSkillLevel: { gte: level } }
      ]
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === 'true'
    }

    // Get teams with pagination
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
          _count: {
            select: {
              members: true
            }
          }
        },
        orderBy: [
          { rating: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.team.count({ where })
    ])

    // Transform data to include member count
    const transformedTeams = teams.map(team => ({
      ...team,
      memberCount: team._count.members
    }))

    return NextResponse.json({
      success: true,
      data: {
        teams: transformedTeams,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: 'Teams retrieved successfully'
    })

  } catch (error) {
    console.error('Get teams error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, maxSize, minSkillLevel, maxSkillLevel, isPublic } = body

    // Validate required fields
    if (!name || !maxSize || minSkillLevel === undefined || maxSkillLevel === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate skill levels
    if (minSkillLevel < 1 || maxSkillLevel > 10 || minSkillLevel > maxSkillLevel) {
      return NextResponse.json(
        { success: false, message: 'Invalid skill level range' },
        { status: 400 }
      )
    }

    // Check if user already has a team with this name
    const existingTeam = await prisma.team.findFirst({
      where: {
        name,
        captainId: user.userId
      }
    })

    if (existingTeam) {
      return NextResponse.json(
        { success: false, message: 'You already have a team with this name' },
        { status: 409 }
      )
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        description: description || null,
        maxSize: parseInt(maxSize),
        minSkillLevel: parseInt(minSkillLevel),
        maxSkillLevel: parseInt(maxSkillLevel),
        isPublic: isPublic !== false,
        captainId: user.userId
      },
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
        }
      }
    })

    // Add captain as team member
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: user.userId,
        role: 'CAPTAIN',
        isStarter: true
      }
    })

    return NextResponse.json({
      success: true,
      data: team,
      message: 'Team created successfully'
    })

  } catch (error) {
    console.error('Create team error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

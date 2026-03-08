import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courtId = params.id

    // Get court with all related data
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            avatar: true,
            isVerified: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                rating: true,
                skillLevel: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        games: {
          where: {
            scheduledAt: {
              gte: new Date()
            }
          },
          include: {
            organizer: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            },
            hostTeam: {
              select: {
                id: true,
                name: true,
                logoUrl: true
              }
            }
          },
          orderBy: { scheduledAt: 'asc' },
          take: 10 // Next 10 upcoming games
        },
        availability: {
          where: {
            isActive: true
          },
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
          ]
        },
        _count: {
          select: {
            reviews: true,
            games: true,
            reservations: true
          }
        }
      }
    })

    if (!court) {
      return NextResponse.json(
        { success: false, message: 'Court not found' },
        { status: 404 }
      )
    }

    // Calculate average rating from reviews
    const avgRating = court.reviews.length > 0 
      ? court.reviews.reduce((sum, review) => sum + review.rating, 0) / court.reviews.length
      : 0

    // Transform data to include computed fields
    const transformedCourt = {
      ...court,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: court._count.reviews,
      totalGames: court._count.games,
      totalReservations: court._count.reservations,
      upcomingGames: court.games
    }

    return NextResponse.json({
      success: true,
      data: transformedCourt,
      message: 'Court retrieved successfully'
    })

  } catch (error) {
    console.error('Get court error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const courtId = params.id
    const body = await request.json()

    // Check if court exists and user has permission to edit
    const existingCourt = await prisma.court.findUnique({
      where: { id: courtId },
      select: {
        id: true,
        createdById: true
      }
    })

    if (!existingCourt) {
      return NextResponse.json(
        { success: false, message: 'Court not found' },
        { status: 404 }
      )
    }

    // Check permissions - only creator can edit (or admin in future)
    if (existingCourt.createdById !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to edit this court' },
        { status: 403 }
      )
    }

    const {
      name,
      address,
      latitude,
      longitude,
      courtType,
      surfaceType,
      hasLighting,
      hasParking,
      amenities,
      photos,
      hourlyRate,
      isBookable
    } = body

    // Validate coordinates if provided
    if (latitude !== undefined && longitude !== undefined) {
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return NextResponse.json(
          { success: false, message: 'Invalid coordinates' },
          { status: 400 }
        )
      }
    }

    // Update court
    const updatedCourt = await prisma.court.update({
      where: { id: courtId },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(courtType && { courtType: courtType.toUpperCase() }),
        ...(surfaceType !== undefined && { surfaceType }),
        ...(hasLighting !== undefined && { hasLighting }),
        ...(hasParking !== undefined && { hasParking }),
        ...(amenities !== undefined && { amenities }),
        ...(photos !== undefined && { photos }),
        ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
        ...(isBookable !== undefined && { isBookable }),
        // Reset verification if location changed
        ...(latitude !== undefined || longitude !== undefined) && { isVerified: false }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            avatar: true,
            isVerified: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCourt,
      message: 'Court updated successfully'
    })

  } catch (error) {
    console.error('Update court error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const courtId = params.id

    // Check if court exists and user has permission to delete
    const existingCourt = await prisma.court.findUnique({
      where: { id: courtId },
      select: {
        id: true,
        createdById: true,
        _count: {
          select: {
            games: true,
            reservations: true
          }
        }
      }
    })

    if (!existingCourt) {
      return NextResponse.json(
        { success: false, message: 'Court not found' },
        { status: 404 }
      )
    }

    // Check permissions - only creator can delete (or admin in future)
    if (existingCourt.createdById !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to delete this court' },
        { status: 403 }
      )
    }

    // Cannot delete courts with active games or reservations
    if (existingCourt._count.games > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete court with scheduled games' },
        { status: 400 }
      )
    }

    if (existingCourt._count.reservations > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete court with active reservations' },
        { status: 400 }
      )
    }

    // Delete court
    await prisma.court.delete({
      where: { id: courtId }
    })

    return NextResponse.json({
      success: true,
      message: 'Court deleted successfully'
    })

  } catch (error) {
    console.error('Delete court error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courtId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Check if court exists
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      select: { id: true }
    })

    if (!court) {
      return NextResponse.json(
        { success: false, message: 'Court not found' },
        { status: 404 }
      )
    }

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.courtReview.findMany({
        where: { courtId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              rating: true,
              skillLevel: true,
              isVerified: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.courtReview.count({ where: { courtId } })
    ])

    // Calculate rating statistics
    const ratingStats = await prisma.courtReview.groupBy({
      by: ['rating'],
      where: { courtId },
      _count: {
        rating: true
      }
    })

    const totalReviews = ratingStats.reduce((sum, stat) => sum + stat._count.rating, 0)
    const averageRating = totalReviews > 0 
      ? ratingStats.reduce((sum, stat) => sum + (stat.rating * stat._count.rating), 0) / totalReviews
      : 0

    const ratingDistribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }
    ratingStats.forEach(stat => {
      ratingDistribution[stat.rating as keyof typeof ratingDistribution] = stat._count.rating
    })

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        statistics: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          ratingDistribution
        }
      },
      message: 'Reviews retrieved successfully'
    })

  } catch (error) {
    console.error('Get court reviews error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const courtId = params.id
    const body = await request.json()
    const { rating, comment } = body

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if court exists
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      select: { id: true }
    })

    if (!court) {
      return NextResponse.json(
        { success: false, message: 'Court not found' },
        { status: 404 }
      )
    }

    // Check if user already reviewed this court
    const existingReview = await prisma.courtReview.findUnique({
      where: {
        courtId_userId: {
          courtId,
          userId: user.userId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'You have already reviewed this court' },
        { status: 409 }
      )
    }

    // Create review
    const review = await prisma.courtReview.create({
      data: {
        courtId,
        userId: user.userId,
        rating: parseInt(rating),
        comment: comment || null
      },
      include: {
        user: {
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

    // Update court's average rating and review count
    const allReviews = await prisma.courtReview.findMany({
      where: { courtId },
      select: { rating: true }
    })

    const newAverageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    const newReviewCount = allReviews.length

    await prisma.court.update({
      where: { id: courtId },
      data: {
        rating: Math.round(newAverageRating * 10) / 10,
        reviewCount: newReviewCount
      }
    })

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review created successfully'
    })

  } catch (error) {
    console.error('Create court review error:', error)
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
    const { rating, comment } = body

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if review exists and user owns it
    const existingReview = await prisma.courtReview.findUnique({
      where: {
        courtId_userId: {
          courtId,
          userId: user.userId
        }
      }
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      )
    }

    // Update review
    const updatedReview = await prisma.courtReview.update({
      where: {
        courtId_userId: {
          courtId,
          userId: user.userId
        }
      },
      data: {
        rating: parseInt(rating),
        comment: comment || null
      },
      include: {
        user: {
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

    // Recalculate court's average rating
    const allReviews = await prisma.courtReview.findMany({
      where: { courtId },
      select: { rating: true }
    })

    const newAverageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.court.update({
      where: { id: courtId },
      data: {
        rating: Math.round(newAverageRating * 10) / 10
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    })

  } catch (error) {
    console.error('Update court review error:', error)
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

    // Check if review exists and user owns it
    const existingReview = await prisma.courtReview.findUnique({
      where: {
        courtId_userId: {
          courtId,
          userId: user.userId
        }
      }
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      )
    }

    // Delete review
    await prisma.courtReview.delete({
      where: {
        courtId_userId: {
          courtId,
          userId: user.userId
        }
      }
    })

    // Recalculate court's average rating and review count
    const allReviews = await prisma.courtReview.findMany({
      where: { courtId },
      select: { rating: true }
    })

    const newAverageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0
    const newReviewCount = allReviews.length

    await prisma.court.update({
      where: { id: courtId },
      data: {
        rating: Math.round(newAverageRating * 10) / 10,
        reviewCount: newReviewCount
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })

  } catch (error) {
    console.error('Delete court review error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

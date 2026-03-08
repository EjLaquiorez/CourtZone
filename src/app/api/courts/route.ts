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
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const courtType = searchParams.get('courtType')
    const hasLighting = searchParams.get('hasLighting')
    const hasParking = searchParams.get('hasParking')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = parseInt(searchParams.get('radius') || '10') // miles

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (courtType) {
      where.courtType = courtType.toUpperCase()
    }

    if (hasLighting !== null) {
      where.hasLighting = hasLighting === 'true'
    }

    if (hasParking !== null) {
      where.hasParking = hasParking === 'true'
    }

    // Get courts with pagination
    const [courts, total] = await Promise.all([
      prisma.court.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              isVerified: true
            }
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 3 // Latest 3 reviews
          },
          _count: {
            select: {
              reviews: true,
              games: true
            }
          }
        },
        orderBy: [
          { isVerified: 'desc' },
          { rating: 'desc' },
          { reviewCount: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.court.count({ where })
    ])

    // Calculate distance if user location provided
    let courtsWithDistance = courts
    if (lat && lng) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)
      
      courtsWithDistance = courts.map(court => {
        const distance = calculateDistance(userLat, userLng, court.latitude, court.longitude)
        return { ...court, distance }
      }).filter(court => court.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
    }

    return NextResponse.json({
      success: true,
      data: {
        courts: courtsWithDistance,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: 'Courts retrieved successfully'
    })

  } catch (error) {
    console.error('Get courts error:', error)
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
      photos 
    } = body

    // Validate required fields
    if (!name || !address || !latitude || !longitude || !courtType) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { success: false, message: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    // Check if court already exists at this location
    const existingCourt = await prisma.court.findFirst({
      where: {
        AND: [
          { latitude: { gte: latitude - 0.001, lte: latitude + 0.001 } },
          { longitude: { gte: longitude - 0.001, lte: longitude + 0.001 } }
        ]
      }
    })

    if (existingCourt) {
      return NextResponse.json(
        { success: false, message: 'A court already exists at this location' },
        { status: 409 }
      )
    }

    // Create court
    const court = await prisma.court.create({
      data: {
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        courtType: courtType.toUpperCase(),
        surfaceType: surfaceType || null,
        hasLighting: hasLighting || false,
        hasParking: hasParking || false,
        amenities: amenities || [],
        photos: photos || [],
        createdById: user.userId,
        isVerified: false // New courts need verification
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            isVerified: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: court,
      message: 'Court created successfully and is pending verification'
    })

  } catch (error) {
    console.error('Create court error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

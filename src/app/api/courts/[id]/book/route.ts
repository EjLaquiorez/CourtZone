import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courtId = params.id;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { startTime, endTime, gameId, notes } = body;

    if (!startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: 'Start time and end time are required' },
        { status: 400 }
      );
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    // Validate time range
    if (startDateTime >= endDateTime) {
      return NextResponse.json(
        { success: false, message: 'End time must be after start time' },
        { status: 400 }
      );
    }

    if (startDateTime < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Cannot book court in the past' },
        { status: 400 }
      );
    }

    // Get court details
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      select: {
        id: true,
        name: true,
        isBookable: true,
        hourlyRate: true
      }
    });

    if (!court) {
      return NextResponse.json(
        { success: false, message: 'Court not found' },
        { status: 404 }
      );
    }

    if (!court.isBookable) {
      return NextResponse.json(
        { success: false, message: 'Court is not available for booking' },
        { status: 400 }
      );
    }

    // Check for conflicts with existing reservations
    const conflictingReservations = await prisma.courtReservation.findMany({
      where: {
        courtId: courtId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            startTime: {
              gte: startDateTime,
              lt: endDateTime
            }
          },
          {
            endTime: {
              gt: startDateTime,
              lte: endDateTime
            }
          },
          {
            AND: [
              { startTime: { lte: startDateTime } },
              { endTime: { gte: endDateTime } }
            ]
          }
        ]
      }
    });

    if (conflictingReservations.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Court is already booked for this time slot' },
        { status: 409 }
      );
    }

    // Calculate total cost
    const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
    const totalCost = court.hourlyRate ? court.hourlyRate * durationHours : 0;

    // Create reservation
    const reservation = await prisma.courtReservation.create({
      data: {
        courtId: courtId,
        userId: payload.userId,
        startTime: startDateTime,
        endTime: endDateTime,
        totalCost: totalCost,
        notes: notes || null,
        gameId: gameId || null,
        status: 'CONFIRMED' // In a real app, this might be PENDING until payment
      },
      include: {
        court: {
          select: {
            id: true,
            name: true,
            address: true,
            courtType: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        game: gameId ? {
          select: {
            id: true,
            title: true,
            gameType: true
          }
        } : false
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        reservation,
        message: 'Court booked successfully!'
      }
    });

  } catch (error) {
    console.error('Error booking court:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's reservations for a court
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courtId = params.id;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const reservations = await prisma.courtReservation.findMany({
      where: {
        courtId: courtId,
        userId: payload.userId
      },
      include: {
        court: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        game: {
          select: {
            id: true,
            title: true,
            gameType: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: { reservations }
    });

  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

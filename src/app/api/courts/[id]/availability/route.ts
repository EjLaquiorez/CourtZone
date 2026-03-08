import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courtId = params.id;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD format
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!date && (!startDate || !endDate)) {
      return NextResponse.json(
        { success: false, message: 'Date or date range required' },
        { status: 400 }
      );
    }

    // Get court details
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: {
        availability: {
          where: { isActive: true }
        }
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

    let queryStartDate: Date;
    let queryEndDate: Date;

    if (date) {
      queryStartDate = new Date(date);
      queryEndDate = new Date(date);
      queryEndDate.setDate(queryEndDate.getDate() + 1);
    } else {
      queryStartDate = new Date(startDate!);
      queryEndDate = new Date(endDate!);
    }

    // Get existing reservations for the date range
    const existingReservations = await prisma.courtReservation.findMany({
      where: {
        courtId: courtId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            startTime: {
              gte: queryStartDate,
              lt: queryEndDate
            }
          },
          {
            endTime: {
              gt: queryStartDate,
              lte: queryEndDate
            }
          },
          {
            AND: [
              { startTime: { lte: queryStartDate } },
              { endTime: { gte: queryEndDate } }
            ]
          }
        ]
      },
      select: {
        startTime: true,
        endTime: true,
        status: true
      }
    });

    // Generate available time slots
    const availableSlots = [];
    const currentDate = new Date(queryStartDate);

    while (currentDate < queryEndDate) {
      const dayOfWeek = currentDate.getDay();
      const dayAvailability = court.availability.filter(a => a.dayOfWeek === dayOfWeek);

      for (const availability of dayAvailability) {
        const [startHour, startMinute] = availability.startTime.split(':').map(Number);
        const [endHour, endMinute] = availability.endTime.split(':').map(Number);

        const slotStart = new Date(currentDate);
        slotStart.setHours(startHour, startMinute, 0, 0);

        const slotEnd = new Date(currentDate);
        slotEnd.setHours(endHour, endMinute, 0, 0);

        // Generate hourly slots
        const currentSlot = new Date(slotStart);
        while (currentSlot < slotEnd) {
          const slotEndTime = new Date(currentSlot);
          slotEndTime.setHours(slotEndTime.getHours() + 1);

          // Check if slot conflicts with existing reservations
          const hasConflict = existingReservations.some(reservation => {
            const resStart = new Date(reservation.startTime);
            const resEnd = new Date(reservation.endTime);
            
            return (
              (currentSlot >= resStart && currentSlot < resEnd) ||
              (slotEndTime > resStart && slotEndTime <= resEnd) ||
              (currentSlot <= resStart && slotEndTime >= resEnd)
            );
          });

          if (!hasConflict && slotEndTime <= slotEnd) {
            availableSlots.push({
              startTime: new Date(currentSlot).toISOString(),
              endTime: new Date(slotEndTime).toISOString(),
              duration: 60, // minutes
              cost: court.hourlyRate || 0
            });
          }

          currentSlot.setHours(currentSlot.getHours() + 1);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      data: {
        court: {
          id: court.id,
          name: court.name,
          hourlyRate: court.hourlyRate,
          isBookable: court.isBookable
        },
        availableSlots,
        existingReservations: existingReservations.map(res => ({
          startTime: res.startTime,
          endTime: res.endTime,
          status: res.status
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching court availability:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

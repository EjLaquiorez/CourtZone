import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;

    // Get game participants and waitlist
    const [participants, waitlist] = await Promise.all([
      prisma.gameParticipant.findMany({
        where: {
          gameId: gameId,
          status: 'JOINED'
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              skillLevel: true,
              rating: true,
              position: true,
              isVerified: true
            }
          }
        },
        orderBy: { joinedAt: 'asc' }
      }),
      prisma.gameWaitlist.findMany({
        where: { gameId: gameId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              skillLevel: true,
              rating: true,
              position: true
            }
          }
        },
        orderBy: { position: 'asc' }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        participants,
        waitlist,
        stats: {
          totalParticipants: participants.length,
          waitlistCount: waitlist.length,
          averageSkillLevel: participants.length > 0 
            ? Math.round(participants.reduce((sum, p) => sum + p.user.skillLevel, 0) / participants.length)
            : 0,
          averageRating: participants.length > 0
            ? Math.round(participants.reduce((sum, p) => sum + p.user.rating, 0) / participants.length)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching game participants:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update participant (for organizer to manage lineup)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
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
    const { participantId, action, position, isStarter } = body;

    // Verify user is the game organizer
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { organizerId: true, status: true }
    });

    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.organizerId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: 'Only game organizer can manage participants' },
        { status: 403 }
      );
    }

    if (game.status !== 'SCHEDULED') {
      return NextResponse.json(
        { success: false, message: 'Cannot modify participants after game has started' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'kick':
        // Remove participant and promote from waitlist
        await prisma.$transaction(async (tx) => {
          await tx.gameParticipant.update({
            where: { id: participantId },
            data: { status: 'KICKED', leftAt: new Date() }
          });

          // Promote next person from waitlist
          const nextWaitlist = await tx.gameWaitlist.findFirst({
            where: { gameId: gameId },
            orderBy: { position: 'asc' }
          });

          if (nextWaitlist) {
            await tx.gameParticipant.create({
              data: {
                gameId: gameId,
                userId: nextWaitlist.userId,
                status: 'JOINED'
              }
            });

            await tx.gameWaitlist.delete({
              where: { id: nextWaitlist.id }
            });

            // Update waitlist positions
            await tx.gameWaitlist.updateMany({
              where: {
                gameId: gameId,
                position: { gt: nextWaitlist.position }
              },
              data: { position: { decrement: 1 } }
            });
          }
        });
        break;

      case 'update_lineup':
        await prisma.gameParticipant.update({
          where: { id: participantId },
          data: {
            position: position || undefined,
            isStarter: isStarter !== undefined ? isStarter : undefined
          }
        });
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Participant updated successfully'
    });

  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

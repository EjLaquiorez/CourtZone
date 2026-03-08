import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(
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

    // Check if user is a participant
    const participant = await prisma.gameParticipant.findUnique({
      where: {
        gameId_userId: {
          gameId: gameId,
          userId: payload.userId
        }
      }
    });

    if (!participant || participant.status !== 'JOINED') {
      return NextResponse.json(
        { success: false, message: 'Not a participant in this game' },
        { status: 400 }
      );
    }

    // Get game details
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        status: true,
        scheduledAt: true,
        organizerId: true
      }
    });

    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if game allows leaving (not started yet)
    if (game.status !== 'SCHEDULED') {
      return NextResponse.json(
        { success: false, message: 'Cannot leave game that has already started' },
        { status: 400 }
      );
    }

    // Prevent organizer from leaving their own game
    if (game.organizerId === payload.userId) {
      return NextResponse.json(
        { success: false, message: 'Game organizer cannot leave their own game' },
        { status: 400 }
      );
    }

    // Update participant status to LEFT
    await prisma.gameParticipant.update({
      where: {
        gameId_userId: {
          gameId: gameId,
          userId: payload.userId
        }
      },
      data: {
        status: 'LEFT',
        leftAt: new Date()
      }
    });

    // Check if there's someone on the waitlist to promote
    const nextWaitlistEntry = await prisma.gameWaitlist.findFirst({
      where: { gameId: gameId },
      orderBy: { position: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            skillLevel: true,
            rating: true
          }
        }
      }
    });

    let promotedUser = null;

    if (nextWaitlistEntry) {
      // Promote user from waitlist to participant
      await prisma.$transaction(async (tx) => {
        // Create participant record
        await tx.gameParticipant.create({
          data: {
            gameId: gameId,
            userId: nextWaitlistEntry.userId,
            status: 'JOINED'
          }
        });

        // Remove from waitlist
        await tx.gameWaitlist.delete({
          where: { id: nextWaitlistEntry.id }
        });

        // Update positions for remaining waitlist entries
        await tx.gameWaitlist.updateMany({
          where: {
            gameId: gameId,
            position: { gt: nextWaitlistEntry.position }
          },
          data: {
            position: { decrement: 1 }
          }
        });
      });

      promotedUser = nextWaitlistEntry.user;

      // TODO: Send notification to promoted user
      // await notificationService.sendGamePromotionNotification(
      //   nextWaitlistEntry.userId,
      //   gameId
      // );
    }

    return NextResponse.json({
      success: true,
      data: {
        leftGame: true,
        promotedUser
      },
      message: promotedUser 
        ? `You've left the game. ${promotedUser.username} has been promoted from the waitlist.`
        : 'You\'ve successfully left the game.'
    });

  } catch (error) {
    console.error('Error leaving game:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

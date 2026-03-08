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

    // Get game details
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        participants: {
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
        },
        waitlist: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                skillLevel: true
              }
            }
          },
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if game is still open for joining
    if (game.status !== 'SCHEDULED') {
      return NextResponse.json(
        { success: false, message: 'Cannot join game that is not scheduled' },
        { status: 400 }
      );
    }

    // Check if user is already a participant
    const existingParticipant = game.participants.find(
      p => p.userId === payload.userId && p.status === 'JOINED'
    );

    if (existingParticipant) {
      return NextResponse.json(
        { success: false, message: 'Already joined this game' },
        { status: 400 }
      );
    }

    // Check if user is already on waitlist
    const existingWaitlist = game.waitlist.find(w => w.userId === payload.userId);
    if (existingWaitlist) {
      return NextResponse.json(
        { success: false, message: 'Already on waitlist for this game' },
        { status: 400 }
      );
    }

    // Get user details for skill validation
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        skillLevel: true,
        rating: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Validate skill level requirements
    if (user.skillLevel < game.skillLevelMin || user.skillLevel > game.skillLevelMax) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Skill level must be between ${game.skillLevelMin} and ${game.skillLevelMax}` 
        },
        { status: 400 }
      );
    }

    // Check if game is full
    const activeParticipants = game.participants.filter(p => p.status === 'JOINED');
    
    if (activeParticipants.length >= game.maxPlayers) {
      // Add to waitlist
      const nextPosition = Math.max(...game.waitlist.map(w => w.position), 0) + 1;
      
      const waitlistEntry = await prisma.gameWaitlist.create({
        data: {
          gameId: gameId,
          userId: payload.userId,
          position: nextPosition
        },
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

      return NextResponse.json({
        success: true,
        data: {
          status: 'waitlisted',
          position: nextPosition,
          waitlistEntry
        },
        message: `Game is full. You've been added to the waitlist at position ${nextPosition}`
      });
    }

    // Add user as participant
    const participant = await prisma.gameParticipant.create({
      data: {
        gameId: gameId,
        userId: payload.userId,
        status: 'JOINED'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            skillLevel: true,
            rating: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        status: 'joined',
        participant
      },
      message: 'Successfully joined the game!'
    });

  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

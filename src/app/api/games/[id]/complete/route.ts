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

    const body = await request.json();
    const { 
      finalScore, 
      hostScore, 
      opponentScore, 
      winnerTeamId, 
      playerStats = [] 
    } = body;

    // Get game details
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        participants: {
          where: { status: 'JOINED' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                rating: true
              }
            }
          }
        },
        hostTeam: true,
        opponentTeam: true
      }
    });

    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }

    // Verify user is the game organizer
    if (game.organizerId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: 'Only game organizer can complete the game' },
        { status: 403 }
      );
    }

    if (game.status !== 'IN_PROGRESS' && game.status !== 'SCHEDULED') {
      return NextResponse.json(
        { success: false, message: 'Game is not in progress' },
        { status: 400 }
      );
    }

    // Update game with results
    const updatedGame = await prisma.$transaction(async (tx) => {
      // Update game status and scores
      const gameUpdate = await tx.game.update({
        where: { id: gameId },
        data: {
          status: 'COMPLETED',
          finalScore: finalScore || null,
          hostScore: hostScore || null,
          opponentScore: opponentScore || null,
          winnerTeamId: winnerTeamId || null,
          gameEndedAt: new Date()
        }
      });

      // Record individual player stats if provided
      if (playerStats && playerStats.length > 0) {
        for (const stat of playerStats) {
          const { userId, points, assists, rebounds, steals, blocks, turnovers, fouls, minutesPlayed } = stat;
          
          // Verify user was a participant
          const participant = game.participants.find(p => p.userId === userId);
          if (participant) {
            await tx.gameStats.create({
              data: {
                gameId: gameId,
                userId: userId,
                points: points || 0,
                assists: assists || 0,
                rebounds: rebounds || 0,
                steals: steals || 0,
                blocks: blocks || 0,
                turnovers: turnovers || 0,
                fouls: fouls || 0,
                minutesPlayed: minutesPlayed || 0
              }
            });
          }
        }
      }

      // Update team statistics if it's a team game
      if (game.hostTeamId && game.opponentTeamId && hostScore !== undefined && opponentScore !== undefined) {
        // Update host team stats
        await tx.team.update({
          where: { id: game.hostTeamId },
          data: {
            gamesPlayed: { increment: 1 },
            wins: hostScore > opponentScore ? { increment: 1 } : undefined
          }
        });

        // Update opponent team stats
        await tx.team.update({
          where: { id: game.opponentTeamId },
          data: {
            gamesPlayed: { increment: 1 },
            wins: opponentScore > hostScore ? { increment: 1 } : undefined
          }
        });
      }

      // Update player season stats
      const currentSeason = new Date().getFullYear().toString();
      
      for (const participant of game.participants) {
        const playerStat = playerStats?.find(s => s.userId === participant.userId);
        const isWinner = winnerTeamId ? 
          (game.hostTeamId === winnerTeamId && participant.user.id === game.organizerId) ||
          (game.opponentTeamId === winnerTeamId) : false;

        // Upsert season stats
        await tx.playerSeasonStats.upsert({
          where: {
            userId_season: {
              userId: participant.userId,
              season: currentSeason
            }
          },
          update: {
            gamesPlayed: { increment: 1 },
            wins: isWinner ? { increment: 1 } : undefined,
            losses: !isWinner ? { increment: 1 } : undefined,
            totalPoints: { increment: playerStat?.points || 0 },
            totalAssists: { increment: playerStat?.assists || 0 },
            totalRebounds: { increment: playerStat?.rebounds || 0 },
            totalSteals: { increment: playerStat?.steals || 0 },
            totalBlocks: { increment: playerStat?.blocks || 0 }
          },
          create: {
            userId: participant.userId,
            season: currentSeason,
            gamesPlayed: 1,
            wins: isWinner ? 1 : 0,
            losses: !isWinner ? 1 : 0,
            totalPoints: playerStat?.points || 0,
            totalAssists: playerStat?.assists || 0,
            totalRebounds: playerStat?.rebounds || 0,
            totalSteals: playerStat?.steals || 0,
            totalBlocks: playerStat?.blocks || 0
          }
        });

        // Calculate and update averages
        const updatedStats = await tx.playerSeasonStats.findUnique({
          where: {
            userId_season: {
              userId: participant.userId,
              season: currentSeason
            }
          }
        });

        if (updatedStats) {
          await tx.playerSeasonStats.update({
            where: { id: updatedStats.id },
            data: {
              avgPoints: updatedStats.gamesPlayed > 0 ? updatedStats.totalPoints / updatedStats.gamesPlayed : 0,
              avgAssists: updatedStats.gamesPlayed > 0 ? updatedStats.totalAssists / updatedStats.gamesPlayed : 0,
              avgRebounds: updatedStats.gamesPlayed > 0 ? updatedStats.totalRebounds / updatedStats.gamesPlayed : 0,
              winPercentage: updatedStats.gamesPlayed > 0 ? (updatedStats.wins / updatedStats.gamesPlayed) * 100 : 0
            }
          });
        }
      }

      return gameUpdate;
    });

    return NextResponse.json({
      success: true,
      data: {
        game: updatedGame,
        message: 'Game completed successfully!'
      }
    });

  } catch (error) {
    console.error('Error completing game:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

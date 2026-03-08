import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || new Date().getFullYear().toString();
    const timeframe = searchParams.get('timeframe') || 'all'; // all, last30, last7

    // Get user basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar: true,
        skillLevel: true,
        rating: true,
        position: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate date range for timeframe
    let dateFilter = {};
    if (timeframe === 'last30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = { createdAt: { gte: thirtyDaysAgo } };
    } else if (timeframe === 'last7') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateFilter = { createdAt: { gte: sevenDaysAgo } };
    }

    // Get season stats
    const seasonStats = await prisma.playerSeasonStats.findUnique({
      where: {
        userId_season: {
          userId: userId,
          season: season
        }
      }
    });

    // Get recent game stats
    const recentGameStats = await prisma.gameStats.findMany({
      where: {
        userId: userId,
        game: dateFilter
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            gameType: true,
            scheduledAt: true,
            status: true,
            finalScore: true,
            court: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Get game participation stats
    const gameParticipation = await prisma.gameParticipant.findMany({
      where: {
        userId: userId,
        status: 'JOINED',
        game: {
          status: 'COMPLETED',
          ...dateFilter
        }
      },
      include: {
        game: {
          select: {
            id: true,
            status: true,
            winnerTeamId: true,
            hostTeamId: true,
            opponentTeamId: true,
            organizerId: true
          }
        }
      }
    });

    // Calculate win/loss record
    const wins = gameParticipation.filter(p => {
      const game = p.game;
      // For pickup games, check if user was on winning side (simplified logic)
      // For team games, check if user's team won
      return game.winnerTeamId ? 
        (game.hostTeamId === game.winnerTeamId || game.opponentTeamId === game.winnerTeamId) :
        false; // For pickup games without clear team structure
    }).length;

    const totalGames = gameParticipation.length;
    const losses = totalGames - wins;
    const winPercentage = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    // Calculate averages from recent games
    const totalStats = recentGameStats.reduce((acc, stat) => ({
      points: acc.points + stat.points,
      assists: acc.assists + stat.assists,
      rebounds: acc.rebounds + stat.rebounds,
      steals: acc.steals + stat.steals,
      blocks: acc.blocks + stat.blocks,
      turnovers: acc.turnovers + stat.turnovers,
      fouls: acc.fouls + stat.fouls,
      minutesPlayed: acc.minutesPlayed + stat.minutesPlayed
    }), {
      points: 0,
      assists: 0,
      rebounds: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
      minutesPlayed: 0
    });

    const gamesCount = recentGameStats.length;
    const averages = gamesCount > 0 ? {
      points: totalStats.points / gamesCount,
      assists: totalStats.assists / gamesCount,
      rebounds: totalStats.rebounds / gamesCount,
      steals: totalStats.steals / gamesCount,
      blocks: totalStats.blocks / gamesCount,
      turnovers: totalStats.turnovers / gamesCount,
      fouls: totalStats.fouls / gamesCount,
      minutesPlayed: totalStats.minutesPlayed / gamesCount
    } : {
      points: 0,
      assists: 0,
      rebounds: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
      minutesPlayed: 0
    };

    // Get position rankings (simplified)
    const positionRankings = await prisma.user.findMany({
      where: {
        position: user.position,
        seasonStats: {
          some: {
            season: season,
            gamesPlayed: { gt: 0 }
          }
        }
      },
      include: {
        seasonStats: {
          where: { season: season }
        }
      },
      orderBy: {
        rating: 'desc'
      },
      take: 100
    });

    const userRank = positionRankings.findIndex(p => p.id === userId) + 1;

    // Calculate achievements (simplified)
    const achievements = [];
    if (seasonStats) {
      if (seasonStats.avgPoints >= 20) achievements.push({ name: 'Scorer', description: '20+ PPG average' });
      if (seasonStats.avgAssists >= 5) achievements.push({ name: 'Playmaker', description: '5+ APG average' });
      if (seasonStats.avgRebounds >= 10) achievements.push({ name: 'Rebounder', description: '10+ RPG average' });
      if (seasonStats.winPercentage >= 70) achievements.push({ name: 'Winner', description: '70%+ win rate' });
      if (seasonStats.gamesPlayed >= 50) achievements.push({ name: 'Iron Man', description: '50+ games played' });
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        seasonStats: seasonStats || {
          season,
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          winPercentage: 0,
          avgPoints: 0,
          avgAssists: 0,
          avgRebounds: 0
        },
        currentPeriodStats: {
          gamesPlayed: totalGames,
          wins,
          losses,
          winPercentage: Math.round(winPercentage * 100) / 100,
          averages: {
            points: Math.round(averages.points * 10) / 10,
            assists: Math.round(averages.assists * 10) / 10,
            rebounds: Math.round(averages.rebounds * 10) / 10,
            steals: Math.round(averages.steals * 10) / 10,
            blocks: Math.round(averages.blocks * 10) / 10,
            turnovers: Math.round(averages.turnovers * 10) / 10,
            fouls: Math.round(averages.fouls * 10) / 10,
            minutesPlayed: Math.round(averages.minutesPlayed * 10) / 10
          }
        },
        recentGames: recentGameStats.map(stat => ({
          gameId: stat.gameId,
          gameTitle: stat.game.title,
          gameType: stat.game.gameType,
          date: stat.game.scheduledAt,
          court: stat.game.court.name,
          stats: {
            points: stat.points,
            assists: stat.assists,
            rebounds: stat.rebounds,
            steals: stat.steals,
            blocks: stat.blocks,
            turnovers: stat.turnovers,
            fouls: stat.fouls,
            minutesPlayed: stat.minutesPlayed
          },
          finalScore: stat.game.finalScore
        })),
        rankings: {
          position: user.position,
          rank: userRank || null,
          totalPlayers: positionRankings.length
        },
        achievements,
        timeframe,
        season
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

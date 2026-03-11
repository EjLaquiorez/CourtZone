import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  computeAchievements,
  getTopBadges,
  type CompletedGameEntry,
  type ParticipationHistory,
  type UserReliabilityCounters,
  type OnboardingContext
} from '@/lib/achievements/engine';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
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
        createdAt: true,
        city: true,
        // Reliability counters
        gamesPlayed: true,
        gamesCompleted: true,
        gamesWithNoShowIssues: true,
        gamesHosted: true,
        gamesHostedCompleted: true,
        gamesHostedWithNoShowIssues: true
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
            organizerId: true,
            courtId: true,
            scheduledAt: true
          }
        }
      }
    });

    // Load participation history for achievement engine (all-time)
    const completedAsPlayerRows = await prisma.gameParticipant.findMany({
      where: {
        userId: userId,
        status: 'JOINED',
        game: { status: 'COMPLETED' }
      },
      select: {
        gameId: true,
        game: { select: { courtId: true, scheduledAt: true } }
      }
    });
    const completedAsHostRows = await prisma.game.findMany({
      where: {
        organizerId: userId,
        status: 'COMPLETED'
      },
      select: { id: true, courtId: true, scheduledAt: true }
    });

    const completedAsPlayer: CompletedGameEntry[] = completedAsPlayerRows.map(
      (r) => ({
        gameId: r.gameId,
        courtId: r.game.courtId,
        scheduledAt: r.game.scheduledAt
      })
    );
    const completedAsHost: CompletedGameEntry[] = completedAsHostRows.map(
      (r) => ({
        gameId: r.id,
        courtId: r.courtId,
        scheduledAt: r.scheduledAt
      })
    );
    const participationHistory: ParticipationHistory = {
      completedAsPlayer,
      completedAsHost
    };

    // Onboarding context: profile complete, courts created, referrals, co-players
    const profileComplete = Boolean(
      user.username &&
      user.position != null &&
      user.skillLevel != null &&
      user.skillLevel > 0
    );
    const courtsCreatedCount = await prisma.court.count({
      where: { createdById: userId }
    });
    const referredUsers = await prisma.user.findMany({
      where: { referrerId: userId },
      select: { id: true, gamesCompleted: true }
    });
    const referralCount = referredUsers.filter((u) => (u.gamesCompleted ?? 0) >= 1).length;
    const completedGameIds = completedAsPlayer.map((e) => e.gameId);
    let distinctCoPlayersCount = 0;
    if (completedGameIds.length > 0) {
      const coPlayerIds = await prisma.gameParticipant.findMany({
        where: {
          gameId: { in: completedGameIds },
          status: 'JOINED',
          userId: { not: userId }
        },
        select: { userId: true }
      });
      distinctCoPlayersCount = new Set(coPlayerIds.map((p) => p.userId)).size;
    }
    const onboarding: OnboardingContext = {
      profileComplete,
      courtsCreatedCount,
      referralCount,
      distinctCoPlayersCount
    };

    const counters: UserReliabilityCounters = {
      gamesPlayed: user.gamesPlayed ?? 0,
      gamesCompleted: user.gamesCompleted ?? 0,
      gamesWithNoShowIssues: user.gamesWithNoShowIssues ?? 0,
      gamesHosted: user.gamesHosted ?? 0,
      gamesHostedCompleted: user.gamesHostedCompleted ?? 0,
      gamesHostedWithNoShowIssues: user.gamesHostedWithNoShowIssues ?? 0
    };
    const achievementsFromEngine = computeAchievements(
      counters,
      participationHistory,
      onboarding
    );
    const topBadges = getTopBadges(achievementsFromEngine, 3);

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

    // Reliability metrics derived from counters
    const playerGamesPlayed = user.gamesPlayed ?? 0;
    const playerGamesCompleted = user.gamesCompleted ?? 0;
    const playerGamesWithNoShowIssues = user.gamesWithNoShowIssues ?? 0;

    const hostGames = user.gamesHosted ?? 0;
    const hostGamesCompleted = user.gamesHostedCompleted ?? 0;
    const hostGamesWithNoShowIssues = user.gamesHostedWithNoShowIssues ?? 0;

    const showUpRate =
      playerGamesCompleted > 0
        ? 1 - playerGamesWithNoShowIssues / playerGamesCompleted
        : null;

    const completionRate =
      playerGamesPlayed > 0
        ? playerGamesCompleted / playerGamesPlayed
        : null;

    const hostCompletionRate =
      hostGames > 0
        ? hostGamesCompleted / hostGames
        : null;

    // Achievements from centralized engine (full metadata + progress)
    const achievements = achievementsFromEngine.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      tier: a.tier,
      category: a.category,
      icon: a.icon,
      points: a.points,
      perkSummary: a.perkSummary,
      isUnlocked: a.isUnlocked,
      ...(a.progress && { progress: a.progress })
    }));

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
        topBadges: topBadges.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          tier: a.tier,
          category: a.category,
          icon: a.icon,
          points: a.points,
          isUnlocked: a.isUnlocked
        })),
        reliability: {
          gamesPlayed: playerGamesPlayed,
          gamesCompleted: playerGamesCompleted,
          gamesWithNoShowIssues: playerGamesWithNoShowIssues,
          showUpRate,
          completionRate,
          hostGames,
          hostGamesCompleted,
          hostGamesWithNoShowIssues,
          hostCompletionRate,
          // Internal flag-style metric, not intended for direct public display
          noShowCount: playerGamesWithNoShowIssues
        },
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

'use client';

import { useState, useEffect, Suspense } from 'react';
import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, Calendar, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav } from '@/components/layout/mobile-nav';
import { GameButton, QuickMatchButton, JoinGameButton } from '@/components/ui/game-button';
import { WinRateCard, GamesPlayedCard, RatingCard, StreakCard } from '@/components/ui/stat-card';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import { PageErrorBoundary } from '@/components/error/error-boundary';
import { cn } from '@/lib/utils';
import { useCurrentUser, useGames, useUserStats, useCourts } from '@/lib/hooks/use-api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSocket } from '@/lib/realtime/socket';
import { MockLogin } from '@/components/auth/mock-login';
import { useToastHelpers } from '@/components/ui/toast';
import { LazyComponentErrorBoundary } from '@/components/error/lazy-error-boundary';
import { GameCard } from '@/components/game/game-card';
import type { GameWithDetails, Court, User as UserType, UserStats } from '@/types';

// Lazy load heavy components
import {
  LazyPlayerStatsDashboard,
  LazyCourtMap,
  PlayerStatsSkeleton,
  CourtMapSkeleton,
  LazyWrapper,
  LazyGameForm,
} from '@/components/lazy';
import { useLazyLoadTracking } from '@/lib/performance/lazy-loading';
import { usePreloadOnHover } from '@/lib/performance/client-lazy-loading';

interface LiveMapHeroProps {
  courts: Court[];
  userLocation?: { lat: number; lng: number };
}

function LiveMapHero({ courts, userLocation }: LiveMapHeroProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg lg:text-xl font-display font-bold text-white">
            Games near you
          </h2>
          <p className="text-xs lg:text-sm text-primary-200">
            Tap a court pin to see runs happening right now.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-dark-300/80 px-3 py-1 text-xs text-primary-200 border border-primary-400/20">
            <span className="mr-1 h-2 w-2 rounded-full bg-primary-500" />
            Open
          </span>
          <span className="inline-flex items-center rounded-full bg-dark-300/80 px-3 py-1 text-xs text-yellow-400/90 border border-yellow-500/30">
            <span className="mr-1 h-2 w-2 rounded-full bg-yellow-400" />
            Filling fast
          </span>
          <span className="inline-flex items-center rounded-full bg-dark-300/80 px-3 py-1 text-xs text-red-400 border border-red-500/40">
            <span className="mr-1 h-2 w-2 rounded-full bg-red-500" />
            Full
          </span>
        </div>
      </div>

      <Suspense fallback={<CourtMapSkeleton />}>
        <LazyComponentErrorBoundary fallback={<CourtMapSkeleton />}>
          <LazyWrapper fallback={<CourtMapSkeleton />}>
            <LazyCourtMap
              courts={courts}
              userLocation={userLocation}
              className="h-[260px] sm:h-[320px] lg:h-[360px]"
            />
          </LazyWrapper>
        </LazyComponentErrorBoundary>
      </Suspense>
    </section>
  );
}

interface GameListSectionProps {
  games: GameWithDetails[];
  joiningGameId: string | null;
  joinedGameId: string | null;
  onJoinGame: (game: GameWithDetails) => void;
}

function GameListSection({ games, joiningGameId, joinedGameId, onJoinGame }: GameListSectionProps) {
  return (
    <section className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base lg:text-lg font-display font-bold text-white">
          Nearby pick-up games
        </h2>
        <span className="text-xs text-primary-300">
          {games.length > 0 ? `${games.length} games today` : 'No games yet – create one'}
        </span>
      </div>

      <div className="space-y-3">
        {games.length > 0 ? (
          games.map((game) => {
            const maxPlayers = game.maxPlayers ?? game.participantCount ?? 10;
            const currentPlayers = game.currentPlayers ?? game.participantCount ?? 1;

            const normalizedGame = {
              ...game,
              maxPlayers,
              currentPlayers,
            } as GameWithDetails;

            const spotsRemaining = Math.max(maxPlayers - currentPlayers, 0);
            const isFull = spotsRemaining <= 0;
            const isJoining = joiningGameId === game.id;
            const isJoined = joinedGameId === game.id;

            return (
              <div key={game.id} className="space-y-3">
                <GameCard
                  game={normalizedGame}
                  variant="dashboard"
                  showActions={false}
                />
                <GameButton
                  variant={isFull ? 'secondary' : 'primary'}
                  size="md"
                  fullWidth
                  disabled={isFull || isJoining}
                  loading={isJoining}
                  onClick={() => onJoinGame(normalizedGame)}
                  className="text-sm"
                >
                  {isFull
                    ? 'Game full'
                    : isJoined
                      ? 'Joined — view details'
                      : 'Join game'}
                </GameButton>
                {spotsRemaining > 0 && spotsRemaining <= 2 && (
                  <p className="text-xs text-warning">
                    Only {spotsRemaining} spot{spotsRemaining === 1 ? '' : 's'} left!
                  </p>
                )}
                {normalizedGame.court && (
                  <div className="flex items-center justify-between text-xs text-primary-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {normalizedGame.court.name}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        normalizedGame.court.address || normalizedGame.court.name,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-info hover:underline"
                    >
                      Get directions
                    </a>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-primary-400/40 bg-dark-300/60 p-4 text-center text-sm text-primary-200">
            No nearby games yet. Be the first to host a run with the Create Game button.
          </div>
        )}
      </div>
    </section>
  );
}

interface PersonalPanelProps {
  user: UserType | undefined;
  upcomingGames: GameWithDetails[];
  recentGames: GameWithDetails[];
  showRookieCardBanner: boolean;
  userStats?: UserStats;
}

function PersonalPanel({
  user,
  upcomingGames,
  recentGames,
  showRookieCardBanner,
  userStats,
}: PersonalPanelProps) {
  return (
    <aside className="space-y-4 lg:space-y-5">
      {showRookieCardBanner && (
        <motion.div
          className="rounded-xl border border-primary-400/40 bg-gradient-to-r from-primary-500/25 to-primary-600/15 p-4 sm:p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/30 text-xl">
              🆔
            </div>
            <div className="space-y-1">
              <p className="font-display text-sm font-bold text-white">
                Complete your profile to earn <span className="text-primary-300">Rookie Card</span>
              </p>
              <p className="text-xs text-primary-200">
                Add position, skill, and city so we can match you with better pick-up runs.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <section className="rounded-xl border border-primary-400/20 bg-dark-300/80 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-display font-semibold text-white">My upcoming games</h3>
          <span className="text-xs text-primary-300">Today &amp; tomorrow</span>
        </div>
        <div className="space-y-3">
          {upcomingGames.length > 0 ? (
            upcomingGames.slice(0, 3).map((game) => (
              <GameCard
                key={game.id}
                game={game}
                variant="compact"
                showActions
              />
            ))
          ) : (
            <p className="text-xs text-primary-300">
              You have no scheduled games. Join an open run from the list or create your own.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-primary-400/20 bg-dark-300/80 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-display font-semibold text-white">Invitations</h3>
          <span className="text-xs text-primary-300">Quick actions</span>
        </div>
        <div className="space-y-2 text-xs text-primary-300">
          <p>No pending invitations right now.</p>
          <p className="text-primary-200">
            When teammates invite you to a run, it will show up here for one-tap join.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-primary-400/20 bg-dark-300/80 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-display font-semibold text-white">Friends online</h3>
          <span className="text-xs text-primary-300">Social presence</span>
        </div>
        <p className="text-xs text-primary-300">
          Real-time friend presence will appear here so you can quickly invite them to a nearby game.
        </p>
      </section>

      <section className="rounded-xl border border-primary-400/20 bg-dark-300/80 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-display font-semibold text-white">Activity</h3>
          <span className="text-xs text-primary-300">Recent</span>
        </div>
        <div className="space-y-2 text-xs text-primary-300">
          {recentGames.length > 0 ? (
            recentGames.slice(0, 3).map((game) => (
              <div key={game.id} className="flex items-center justify-between rounded-lg bg-dark-200/60 px-3 py-2">
                <div className="space-y-0.5">
                  <p className="font-medium text-primary-100 text-xs">
                    vs {game.opponentTeam?.name || 'Open run'}
                  </p>
                  <p className="text-[11px] text-primary-300">
                    {new Date(game.scheduledTime || game.scheduledAt || game.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-court-400">
                  {game.winnerTeamId ? 'W' : 'L'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-primary-300">
              Your recent games and achievements will appear here after you play a few runs.
            </p>
          )}
        </div>
      </section>

      {recentGames.length > 0 && (
        <section className="rounded-xl border border-primary-400/20 bg-dark-300/80 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-display font-semibold text-white">Quick re-invite</h3>
            <span className="text-xs text-primary-300">1-tap rematch</span>
          </div>
          <p className="mb-3 text-xs text-primary-300">
            Spin up a new game with the same opponent and court as your last match.
          </p>
          <GameButton
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => {
              const last = recentGames[0];
              if (last?.court?.id) {
                router.push(`/games/create?courtId=${last.court.id}`);
              } else {
                router.push('/games/create');
              }
            }}
          >
            Play again with last team
          </GameButton>
        </section>
      )}

      {userStats && (
        <section className="rounded-xl bg-dark-300/70 p-4">
          <details className="space-y-2">
            <summary className="flex cursor-pointer items-center justify-between text-sm text-primary-100">
              <span className="font-display font-semibold">My stats</span>
              <span className="text-xs text-primary-300">
                {userStats.gamesPlayed} games • {userStats.currentStreak} streak
              </span>
            </summary>
            <div className="grid grid-cols-2 gap-2 text-xs text-primary-300 pt-1">
              <div>
                <p className="text-primary-200">Record</p>
                <p>{userStats.wins} W • {userStats.losses} L</p>
              </div>
              <div>
                <p className="text-primary-200">Best streak</p>
                <p>{userStats.bestStreak}</p>
              </div>
              <div>
                <p className="text-primary-200">Points</p>
                <p>{userStats.totalPoints}</p>
              </div>
              <div>
                <p className="text-primary-200">Rebounds / Assists</p>
                <p>{userStats.totalRebounds} REB • {userStats.totalAssists} AST</p>
              </div>
            </div>
          </details>
        </section>
      )}
    </aside>
  );
}

interface CreateGameFabProps {
  onCreate: () => void;
}

function CreateGameFab({ onCreate }: CreateGameFabProps) {
  return (
    <button
      type="button"
      onClick={onCreate}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-basketball transition-all duration-200 hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 sm:h-16 sm:w-16"
      aria-label="Create game"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}

function DashboardPageContent() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);
  const [joinedGameId, setJoinedGameId] = useState<string | null>(null);
  const [showCreateGameSheet, setShowCreateGameSheet] = useState(false);
  // Removed unused socketError state
  const toast = useToastHelpers();

  // Prevent background scroll when the modal is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = showCreateGameSheet ? 'hidden' : prev || '';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showCreateGameSheet]);

  // Track lazy loading performance
  useLazyLoadTracking('DashboardPage');

  // Preload handlers for better UX
  const playerStatsPreload = usePreloadOnHover(
    () => import('@/components/stats/player-stats-dashboard'),
    'PlayerStatsDashboard'
  );

  const courtMapPreload = usePreloadOnHover(
    () => import('@/components/maps/court-map'),
    'CourtMap'
  );

  // Get current user data
  const { data: currentUserResponse, isLoading: userLoading, error: userError } = useCurrentUser();
  const user = currentUserResponse?.data;

  // User stats (for onboarding badge banner)
  const { data: userStatsResponse } = useUserStats(user?.id ?? '', undefined, 'all');
  const userStats = userStatsResponse?.data?.stats as UserStats | undefined;
  const achievements = (userStatsResponse?.data?.achievements ?? []) as Array<{ id: string; isUnlocked: boolean }>;
  const rookieCardUnlocked = achievements.some((a) => a.id === 'rookie-card' && a.isUnlocked);
  // Only show banner when stats have loaded and profile is not complete (so it disappears once Rookie Card is unlocked)
  const showRookieCardBanner = user && userStatsResponse !== undefined && !rookieCardUnlocked;

  // Get recent games (user's game history)
  const { data: recentGamesResponse, isLoading: gamesLoading, error: gamesError } = useGames(
    { status: 'completed' },
    1,
    5
  );
  const recentGames = recentGamesResponse?.data?.data || [];

  // Get upcoming games
  const { data: upcomingGamesResponse, isLoading: upcomingLoading, error: upcomingError } = useGames(
    { status: 'scheduled' },
    1,
    5
  );
  const upcomingGames = upcomingGamesResponse?.data?.data || [];

  // Nearby courts for live map hero
  const { data: courtsResponse } = useCourts(undefined, 1, 8);
  const courts = (courtsResponse?.data?.data || []) as Court[];

  const userLocation = user?.locationLat && user?.locationLng
    ? { lat: user.locationLat, lng: user.locationLng }
    : undefined;

  const handleJoinGame = (game: GameWithDetails) => {
    setJoiningGameId(game.id);
    setJoinedGameId(null);

    // Simulated loading state then redirect
    setTimeout(() => {
      setJoiningGameId(null);
      setJoinedGameId(game.id);
      router.push(`/games/${game.id}`);
    }, 500);
  };

  // Initialize auth and socket connection
  const { isAuthenticated } = useAuthStore();
  const { connect: connectSocket, isConnected: socketConnected, isConnecting: socketConnecting, connectionError } = useSocket();

  // Handle socket connection errors gracefully
  useEffect(() => {
    if (connectionError) {
      // Only show error once and don't spam the user
      console.warn('🏀 Court Zone: Real-time features temporarily unavailable:', connectionError);
      // Optionally show a less intrusive notification
      // toast.info('Real-time features temporarily unavailable');
    }
  }, [connectionError, toast]);

  // Handle API errors
  useEffect(() => {
    if (userError) {
      toast.error('Failed to load user data', 'Please try refreshing the page.');
    }
    if (gamesError) {
      toast.error('Failed to load games', 'Some game data may be unavailable.');
    }
    if (upcomingError) {
      toast.error('Failed to load upcoming games', 'Some game data may be unavailable.');
    }
  }, [userError, gamesError, upcomingError, toast]);

  // Remove auth initialization - handled by AuthProvider

  useEffect(() => {
    // Connect to socket when user is authenticated (optional feature)
    if (user && !socketConnected && !socketConnecting) {
      // Only attempt connection if WebSocket server is expected to be available
      const shouldAttemptConnection = process.env.NODE_ENV === 'production' ||
                                     process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true';

      if (shouldAttemptConnection) {
        connectSocket().catch((error) => {
          const errorMessage = error instanceof Error ? error.message : 'Failed to connect to real-time server';
          console.warn('🏀 Court Zone: Socket connection failed (this is expected in development):', errorMessage);
          // Socket error handled by connectionError state
        });
      }
    }
  }, [user, connectSocket, socketConnected, socketConnecting]);

  const isLoading = userLoading || gamesLoading || upcomingLoading;
  // Error handling is done in useEffect above

  // Show login screen if not authenticated
  if (!isAuthenticated && !userLoading) {
    return <MockLogin />;
  }

  // Show loading skeleton while data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 lg:h-screen lg:overflow-hidden">
        <div className="flex lg:h-full">
          <div className="hidden lg:block">
            <Sidebar
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
          <div className="flex-1 min-w-0 lg:flex lg:h-full lg:flex-col lg:overflow-hidden">
            <AuthenticatedHeader
              user={user || { username: 'Loading...', avatar: '', rating: 0 }}
              onMenuToggle={() => setMobileSidebarOpen(true)}
              socketConnected={socketConnected}
            />
            <div className="lg:flex-1 lg:overflow-y-auto">
              <DashboardSkeleton />
            </div>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 lg:h-screen lg:overflow-hidden">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex lg:h-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:flex lg:h-full lg:flex-col lg:overflow-hidden">
          {/* Header */}
          <AuthenticatedHeader
            user={user || { username: 'Loading...', avatar: '', rating: 0 }}
            onMenuToggle={() => setMobileSidebarOpen(true)}
            socketConnected={socketConnected}
          />

          {/* Dashboard Content */}
          <main className="p-4 lg:flex-1 lg:overflow-y-auto lg:p-8">
            {/* Zone 1: In-page top bar (search + quick actions) */}
            <motion.div
              className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
                  Where can you play right now?
                </h1>
                <p className="mt-1 text-sm lg:text-base text-primary-200">
                  Find pick-up games near you, join in one tap, or host your own run.
                </p>
              </div>
              <div className="flex flex-1 items-center gap-2 sm:max-w-md sm:justify-end">
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-300" />
                  <input
                    type="search"
                    placeholder="Search courts or games"
                    className="w-full rounded-full border border-primary-400/30 bg-dark-300/80 py-2 pl-9 pr-3 text-sm text-primary-100 placeholder:text-primary-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                  />
                </div>
                <GameButton
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => router.push('/games')}
                  icon={<MapPin className="h-4 w-4" />}
                >
                  Nearby
                </GameButton>
              </div>
            </motion.div>

            {/* Zone 2 + Zone 3: 3-zone layout */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
              {/* Zone 2: Main content (map + list) */}
              <section className="space-y-4">
                <LiveMapHero courts={courts} userLocation={userLocation} />

                {/* Compact stats row to keep personal context visible but unobtrusive */}
                <motion.div
                  className="grid grid-cols-2 gap-3 md:grid-cols-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <GamesPlayedCard
                    games={recentGames.length}
                    trend={{ direction: 'up', value: 0, label: 'recent' }}
                  />
                  <WinRateCard
                    winRate={0}
                    trend={{ direction: 'neutral', value: 0, label: 'load analytics for details' }}
                  />
                  <RatingCard
                    rating={user?.rating || 0}
                    trend={{ direction: 'neutral', value: 0, label: 'current rating' }}
                  />
                  <StreakCard
                    streak={0}
                    trend={{ direction: 'neutral', value: 0, label: 'streak' }}
                  />
                </motion.div>

                <GameListSection
                  games={upcomingGames as GameWithDetails[]}
                  joiningGameId={joiningGameId}
                  joinedGameId={joinedGameId}
                  onJoinGame={handleJoinGame}
                />
              </section>

              {/* Zone 3: Personal side panel */}
              <PersonalPanel
                user={user as UserType | undefined}
                upcomingGames={upcomingGames as GameWithDetails[]}
                recentGames={recentGames as GameWithDetails[]}
                showRookieCardBanner={!!showRookieCardBanner}
                userStats={userStats}
              />
            </div>

            {/* Floating create-game FAB (global primary action) */}
            <CreateGameFab onCreate={() => setShowCreateGameSheet(true)} />

            {/* Create Game modal / bottom sheet */}
            {showCreateGameSheet && (
              <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
                <motion.div
                  className="w-full rounded-t-2xl bg-dark-900/95 p-0 shadow-2xl sm:rounded-2xl sm:border sm:border-primary-400/30 sm:bg-dark-900"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.25 }}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Create game"
                >
                  <Suspense fallback={<div className="py-12 text-center text-primary-200">Loading form...</div>}>
                    <LazyComponentErrorBoundary fallback={<div className="py-12 text-center text-primary-200">Unable to load form.</div>}>
                      <LazyWrapper>
                        <LazyGameForm
                          courts={courts}
                          onSubmit={async () => {
                            // Let the form handle its own validation and toasts; just close after short delay.
                            setTimeout(() => {
                              setShowCreateGameSheet(false);
                            }, 600);
                          }}
                          onCancel={() => setShowCreateGameSheet(false)}
                        />
                      </LazyWrapper>
                    </LazyComponentErrorBoundary>
                  </Suspense>
                </motion.div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      {!showCreateGameSheet && (
        <MobileBottomNav
          notifications={{
            games: { count: 2, type: 'info', label: 'New game invitations' },
            teams: { count: 1, type: 'warning', label: 'Team roster update needed' },
            achievements: { count: 3, type: 'success', label: 'New achievements unlocked!' },
            profile: { count: 1, type: 'urgent', label: 'Profile verification required' }
          }}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <PageErrorBoundary>
      <DashboardPageContent />
    </PageErrorBoundary>
  );
}

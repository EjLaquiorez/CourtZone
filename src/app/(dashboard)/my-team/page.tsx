'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Users, Calendar, UserMinus } from 'lucide-react';

import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav } from '@/components/layout/mobile-nav';
import { GameButton } from '@/components/ui/game-button';
import { GameCard } from '@/components/game/game-card';
import { cn } from '@/lib/utils';
import { useCurrentUser, useUserTeams, useTeamGames, useLeaveTeam } from '@/lib/hooks/use-api';
import type { TeamWithMembers, GameWithDetails, TeamMember, User as UserType } from '@/types';

export default function MyTeamPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { data: currentUserResponse, isLoading: userLoading } = useCurrentUser();
  const currentUser = currentUserResponse?.data as UserType | undefined;
  const userId = currentUser?.id ?? '';

  const {
    data: userTeamsResponse,
    isLoading: teamsLoading,
    error: teamsError,
    refetch: refetchTeams,
  } = useUserTeams(userId, 1, 3, {
    enabled: !!userId,
    retry: (failureCount, error: any) => {
      // Do not retry on 404 - treat as \"no team\" instead of an error
      if (error && (error.status === 404 || error?.response?.status === 404)) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const notFoundError =
    (teamsError as any)?.status === 404 || (teamsError as any)?.response?.status === 404;

  const myTeam: TeamWithMembers | null =
    userTeamsResponse?.data?.data && userTeamsResponse.data.data.length > 0
      ? userTeamsResponse.data.data[0]
      : null;

  const {
    data: teamGamesResponse,
    isLoading: teamGamesLoading,
  } = useTeamGames(myTeam?.id ?? '', 'scheduled', 1, 5, {
    enabled: !!myTeam?.id,
  });

  const leaveTeamMutation = useLeaveTeam();

  const upcomingGames: GameWithDetails[] = teamGamesResponse?.data?.data ?? [];

  const isLoading = userLoading || teamsLoading;

  const sortedMembers: TeamMember[] = useMemo(() => {
    if (!myTeam) return [];
    const members = myTeam.members ?? [];
    return [...members].sort((a, b) => {
      const order = { captain: 0, co_captain: 1, member: 2 } as const;
      return order[a.role] - order[b.role];
    });
  }, [myTeam]);

  const handleLeaveTeam = async () => {
    if (!myTeam) return;
    const confirmed = window.confirm('Are you sure you want to leave this team?');
    if (!confirmed) return;
    try {
      await leaveTeamMutation.mutateAsync(myTeam.id);
      await refetchTeams();
    } catch (err) {
      console.error('Failed to leave team', err);
    }
  };

  const handleCreateTeam = () => {
    router.push('/teams/create');
  };

  const handleGoToTeam = () => {
    if (myTeam) {
      router.push(`/teams/${myTeam.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 lg:h-screen lg:overflow-hidden">
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex lg:h-full">
        <div className="hidden lg:block">
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        <div className="flex-1 min-w-0 lg:flex lg:h-full lg:flex-col lg:overflow-hidden">
          <AuthenticatedHeader
            user={currentUser || { username: 'Loading...', avatar: '', rating: 0 }}
            onMenuToggle={() => setMobileSidebarOpen(true)}
          />

          <main className="p-4 lg:flex-1 lg:overflow-y-auto lg:p-8">
            {/* Page header */}
            <motion.div
              className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <h1 className="mb-1 text-xl lg:text-2xl font-semibold text-slate-100">
                  My team
                </h1>
                <p className="text-sm text-slate-400">
                  Manage your squad, games, and invites from one place.
                </p>
              </div>

              {myTeam && (
                <div className="flex flex-wrap gap-2">
                  <GameButton
                    variant="primary"
                    size="sm"
                    onClick={handleGoToTeam}
                  >
                    View team page
                  </GameButton>
                  <GameButton
                    variant="secondary"
                    size="sm"
                    onClick={handleCreateTeam}
                  >
                    Create another team
                  </GameButton>
                </div>
              )}
            </motion.div>

            {/* Loading / error states */}
            {isLoading && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                <p className="text-sm text-slate-400">Loading your team…</p>
              </div>
            )}

            {teamsError && !isLoading && !notFoundError && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-center">
                <p className="mb-2 text-sm font-semibold text-slate-100">
                  Unable to load team
                </p>
                <p className="mb-4 text-sm text-slate-500">
                  Please try again in a moment.
                </p>
                <GameButton
                  variant="primary"
                  size="sm"
                  onClick={() => refetchTeams()}
                >
                  Retry
                </GameButton>
              </div>
            )}

            {!isLoading && (!teamsError || notFoundError) && (
              <>
                {myTeam ? (
                  <section className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.5fr)]">
                    {/* Left column: overview + members */}
                    <div className="space-y-6">
                      {/* Overview */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-100">
                            {myTeam.logoUrl ? (
                              <img
                                src={myTeam.logoUrl}
                                alt={myTeam.name}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              myTeam.name
                                .split(' ')
                                .map((p) => p[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <h2 className="text-base font-semibold text-slate-100">
                              {myTeam.name}
                            </h2>
                            {myTeam.description && (
                              <p className="text-sm text-slate-400">
                                {myTeam.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                              <span>
                                {myTeam.memberCount}/{myTeam.maxSize} members
                              </span>
                              <span className="text-slate-600">•</span>
                              <span>{myTeam.isPublic ? 'Public team' : 'Private team'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Members */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Members
                          </h3>
                          <span className="text-xs text-slate-500">
                            {sortedMembers.length} total
                          </span>
                        </div>
                        <div className="space-y-3">
                          {sortedMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-100">
                                  {member.user?.username
                                    ? member.user.username
                                        .split(' ')
                                        .map((p) => p[0])
                                        .join('')
                                        .slice(0, 2)
                                        .toUpperCase()
                                    : 'P'}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-slate-100">
                                    {member.user?.username ?? 'Player'}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {member.position ?? 'Position TBD'}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={cn(
                                  'rounded-full px-2 py-0.5 text-[11px] font-medium',
                                  member.role === 'captain'
                                    ? 'bg-slate-800 text-slate-100'
                                    : member.role === 'co_captain'
                                      ? 'bg-slate-900 text-slate-300 border border-slate-700'
                                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                                )}
                              >
                                {member.role === 'co_captain' ? 'Co‑captain' : member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                              </span>
                            </div>
                          ))}
                          {sortedMembers.length === 0 && (
                            <p className="text-sm text-slate-500">
                              No members yet. Invite players to join your team.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right column: games + actions */}
                    <div className="space-y-6">
                      {/* Upcoming games */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Upcoming team games
                          </h3>
                          {teamGamesLoading && (
                            <span className="text-[11px] text-slate-500">
                              Loading…
                            </span>
                          )}
                        </div>
                        {upcomingGames.length > 0 ? (
                          <div className="space-y-3">
                            {upcomingGames.map((game) => (
                              <GameCard
                                key={game.id}
                                game={game}
                                variant="dashboardMinimal"
                                showActions
                                onViewDetails={() => router.push(`/games/${game.id}`)}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            No scheduled games yet. Create a new game and select this team as host.
                          </p>
                        )}
                      </div>

                      {/* Team actions */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
                        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                          Team actions
                        </h3>
                        <div className="space-y-3">
                          <GameButton
                            variant="primary"
                            size="sm"
                            onClick={handleGoToTeam}
                            icon={<Users className="h-4 w-4" />}
                            fullWidth
                          >
                            Invite players
                          </GameButton>
                          <GameButton
                            variant="secondary"
                            size="sm"
                            onClick={handleGoToTeam}
                            fullWidth
                          >
                            Edit team settings
                          </GameButton>
                          <GameButton
                            variant="danger"
                            size="sm"
                            onClick={handleLeaveTeam}
                            loading={leaveTeamMutation.isPending}
                            icon={<UserMinus className="h-4 w-4" />}
                            fullWidth
                          >
                            Leave team
                          </GameButton>
                        </div>
                      </div>
                    </div>
                  </section>
                ) : (
                  // Empty state
                  <section className="flex items-center justify-center">
                    <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900/80 p-8 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-200">
                        <Users className="h-6 w-6" />
                      </div>
                      <h2 className="mb-2 text-base font-semibold text-slate-100">
                        You’re not on a team yet
                      </h2>
                      <p className="mb-6 text-sm text-slate-400">
                        Create a team to organize games, invite players, and track your squad’s progress.
                      </p>
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <GameButton
                          variant="primary"
                          size="md"
                          onClick={handleCreateTeam}
                        >
                          Create Your Team
                        </GameButton>
                        <GameButton
                          variant="ghost"
                          size="md"
                          onClick={() => router.push('/teams')}
                        >
                          Join via invite code
                        </GameButton>
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}


'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Calendar, Clock3, Globe2, Lock, Search, Share2, UserPlus, Users } from 'lucide-react';

import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav } from '@/components/layout/mobile-nav';
import { GameButton } from '@/components/ui/game-button';
import { GameCard } from '@/components/game/game-card';
import { cn } from '@/lib/utils';
import {
  useCurrentUser,
  useLeaveTeam,
  useRemoveTeamMember,
  useSendTeamInvite,
  useTeamHub,
  useTransferTeamCaptain,
  useUpdateTeamInviteStatus,
  useUpdateTeamMemberRole,
  useUserTeams,
} from '@/lib/hooks/use-api';
import type { TeamActivity, TeamInvite, TeamMember, TeamWithMembers, User as UserType } from '@/types';

type HubTab = 'overview' | 'members' | 'games' | 'activity' | 'invites';
type MemberSort = 'skill' | 'joined' | 'activity';

const formatDate = (value?: string | Date | null) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const activityLabelByType: Record<TeamActivity['type'], string> = {
  team_created: 'Team created',
  member_joined: 'Member joined',
  member_left: 'Member left',
  member_removed: 'Member removed',
  member_promoted: 'Role updated',
  captain_transferred: 'Captain changed',
  game_scheduled: 'Game scheduled',
  game_result: 'Game result',
  invite_sent: 'Invite sent',
  invite_accepted: 'Invite accepted',
  team_updated: 'Team updated',
};

export default function MyTeamPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<HubTab>('overview');
  const [memberSort, setMemberSort] = useState<MemberSort>('skill');
  const [visibleMembers, setVisibleMembers] = useState(8);
  const [inviteUsername, setInviteUsername] = useState('');

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

  const notFoundError = (teamsError as any)?.status === 404 || (teamsError as any)?.response?.status === 404;

  const myTeam = userTeamsResponse?.data?.data?.[0] ?? null;
  const teamId = myTeam?.id ?? '';

  const {
    data: teamHubResponse,
    isLoading: hubLoading,
    error: hubError,
    refetch: refetchHub,
  } = useTeamHub(teamId, {
    enabled: !!teamId,
  });
  const leaveTeamMutation = useLeaveTeam();
  const sendInviteMutation = useSendTeamInvite();
  const updateInviteStatusMutation = useUpdateTeamInviteStatus();
  const updateMemberRoleMutation = useUpdateTeamMemberRole();
  const removeMemberMutation = useRemoveTeamMember();
  const transferCaptainMutation = useTransferTeamCaptain();

  const teamHub = teamHubResponse?.data;
  const hubTeam = teamHub?.team as TeamWithMembers | undefined;
  const hubStats = teamHub?.stats;
  const teamRole = teamHub?.role ?? null;
  const isCaptain = teamRole === 'captain';
  const canManage = teamRole === 'captain' || teamRole === 'co_captain';

  const isLoading = userLoading || teamsLoading || (Boolean(teamId) && hubLoading);

  const activityCountByUser = useMemo(() => {
    const map = new Map<string, number>();
    const items = teamHub?.activity ?? [];
    for (const item of items) {
      if (!item.userId) continue;
      map.set(item.userId, (map.get(item.userId) ?? 0) + 1);
    }
    return map;
  }, [teamHub?.activity]);

  const sortedMembers = useMemo(() => {
    const members = hubTeam?.members ?? [];
    const roleWeight: Record<string, number> = { captain: 0, co_captain: 1, member: 2 };
    const output = [...members]
      .filter((member) => (member as any).status ? (member as any).status === 'active' : true)
      .sort((a, b) => roleWeight[a.role] - roleWeight[b.role]);

    if (memberSort === 'skill') {
      output.sort((a, b) => (b.user?.skillLevel ?? 0) - (a.user?.skillLevel ?? 0));
    } else if (memberSort === 'joined') {
      output.sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
    } else if (memberSort === 'activity') {
      output.sort(
        (a, b) =>
          (activityCountByUser.get(b.userId) ?? 0) - (activityCountByUser.get(a.userId) ?? 0)
      );
    }
    return output;
  }, [activityCountByUser, hubTeam?.members, memberSort]);

  const visibleSortedMembers = sortedMembers.slice(0, visibleMembers);
  const upcomingGames = teamHub?.upcomingGames ?? [];
  const recentResults = teamHub?.recentResults ?? [];
  const activityItems = teamHub?.activity ?? [];
  const pendingInvites = teamHub?.pendingInvites ?? [];

  const handleLeaveTeam = async () => {
    if (!teamId) return;
    const confirmed = window.confirm('Are you sure you want to leave this team?');
    if (!confirmed) return;
    try {
      await leaveTeamMutation.mutateAsync(teamId);
      await refetchTeams();
      await refetchHub();
    } catch (err) {
      console.error('Failed to leave team', err);
    }
  };

  const handleCreateTeam = () => {
    router.push('/teams/create');
  };

  const handleShareTeam = async () => {
    if (!hubTeam || typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/teams/${hubTeam.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      window.alert('Team link copied to clipboard.');
    } catch (error) {
      console.error('Failed to copy link', error);
      window.prompt('Copy this team link:', shareUrl);
    }
  };

  const handleInviteByUsername = async () => {
    if (!teamId || !inviteUsername.trim()) return;
    try {
      await sendInviteMutation.mutateAsync({
        teamId,
        username: inviteUsername.trim(),
      });
      setInviteUsername('');
      await refetchHub();
    } catch (error) {
      console.error('Failed to send invite', error);
      window.alert(error instanceof Error ? error.message : 'Failed to send invite');
    }
  };

  const handleCancelInvite = async (invite: TeamInvite) => {
    if (!teamId) return;
    try {
      await updateInviteStatusMutation.mutateAsync({
        teamId,
        inviteId: invite.id,
        status: 'cancelled',
      });
      await refetchHub();
    } catch (error) {
      console.error('Failed to cancel invite', error);
      window.alert(error instanceof Error ? error.message : 'Failed to cancel invite');
    }
  };

  const handleUpdateMemberRole = async (member: TeamMember, role: 'co_captain' | 'member') => {
    if (!teamId) return;
    try {
      await updateMemberRoleMutation.mutateAsync({
        teamId,
        memberId: member.id,
        role,
      });
      await refetchHub();
    } catch (error) {
      console.error('Failed to update role', error);
      window.alert(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const handleKickMember = async (member: TeamMember) => {
    if (!teamId) return;
    const confirmed = window.confirm(`Remove ${member.user?.username ?? 'this member'} from team?`);
    if (!confirmed) return;
    try {
      await removeMemberMutation.mutateAsync({ teamId, memberId: member.id });
      await refetchHub();
    } catch (error) {
      console.error('Failed to remove member', error);
      window.alert(error instanceof Error ? error.message : 'Failed to remove member');
    }
  };

  const handleTransferCaptain = async (member: TeamMember) => {
    if (!teamId || !member.userId) return;
    const confirmed = window.confirm(
      `Transfer captain role to ${member.user?.username ?? 'this member'}?`
    );
    if (!confirmed) return;
    try {
      await transferCaptainMutation.mutateAsync({
        teamId,
        newCaptainUserId: member.userId,
      });
      await refetchHub();
    } catch (error) {
      console.error('Failed to transfer captain', error);
      window.alert(error instanceof Error ? error.message : 'Failed to transfer captain');
    }
  };

  const tabConfig: Array<{ id: HubTab; label: string; hidden?: boolean }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'games', label: 'Games' },
    { id: 'activity', label: 'Activity' },
  ];
  const usageTabs = tabConfig.filter((tab): tab is { id: HubTab; label: string } => !tab.hidden);

  useEffect(() => {
    if (activeTab === 'invites' && !canManage) {
      setActiveTab('overview');
    }
  }, [activeTab, canManage]);

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
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <h1 className="mb-1 text-xl lg:text-2xl font-semibold text-slate-100">
                  My team
                </h1>
                <p className="text-sm text-slate-400">
                  Team management dashboard powered by live data.
                </p>
              </div>
            </motion.div>

            {isLoading && (
              <div className="space-y-4">
                <div className="h-28 animate-pulse rounded-xl bg-slate-900/70" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-900/60" />
                  ))}
                </div>
                <div className="h-72 animate-pulse rounded-xl bg-slate-900/60" />
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

            {hubError && !isLoading && teamId && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-center">
                <p className="mb-2 text-sm font-semibold text-slate-100">Unable to load team hub</p>
                <p className="mb-4 text-sm text-slate-500">Please retry in a moment.</p>
                <GameButton variant="primary" size="sm" onClick={() => refetchHub()}>
                  Retry
                </GameButton>
              </div>
            )}

            {!isLoading && !teamId && (!teamsError || notFoundError) && (
              <section className="flex items-center justify-center">
                <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900/80 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-200">
                    <Users className="h-6 w-6" />
                  </div>
                  <h2 className="mb-2 text-base font-semibold text-slate-100">You are not on a team yet</h2>
                  <p className="mb-6 text-sm text-slate-400">
                    Create a team to manage players, track results, and schedule games.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <GameButton variant="primary" size="md" onClick={handleCreateTeam}>
                      Create Your Team
                    </GameButton>
                    <GameButton variant="ghost" size="md" onClick={() => router.push('/teams')}>
                      Browse Teams
                    </GameButton>
                  </div>
                </div>
              </section>
            )}

            {!isLoading && teamId && teamHub && hubStats && hubTeam && !hubError && (
              <>
                <section className="mb-8 rounded-2xl bg-slate-900/70 px-6 py-8 text-center">
                  <div className="mx-auto max-w-4xl">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-slate-100">
                        {hubTeam.logoUrl ? (
                          <img src={hubTeam.logoUrl} alt={hubTeam.name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          hubTeam.name
                            .split(' ')
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                        )}
                      </div>
                    <h2 className="text-2xl font-semibold text-slate-100 lg:text-3xl">{hubTeam.name}</h2>
                    <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400">
                      {hubTeam.description || 'Competitive pickup squad'}
                    </p>
                    <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/60 px-2 py-0.5 text-xs"
                        title={hubTeam.isPublic ? 'Public team' : 'Private team'}
                      >
                        {hubTeam.isPublic ? <Globe2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        <span>{hubTeam.isPublic ? 'Public' : 'Private'}</span>
                      </span>
                      <span>•</span>
                      <span>Games {hubStats.totalGamesPlayed}</span>
                      <span>•</span>
                      <span>Win rate {hubStats.winRate}%</span>
                      <span>•</span>
                      <span>Record {hubStats.winRecord}</span>
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                      {canManage && (
                        <GameButton variant="primary" size="sm" onClick={() => setActiveTab('invites')} icon={<UserPlus className="h-4 w-4" />}>
                          Invite Players
                        </GameButton>
                      )}
                      <GameButton variant="ghost" size="sm" onClick={handleShareTeam} icon={<Share2 className="h-4 w-4" />}>
                        Share Team
                      </GameButton>
                    </div>
                  </div>
                </section>

                <section className="sticky top-0 z-10 mb-6 border-b border-slate-800/70 bg-slate-950/95 backdrop-blur">
                  <div className="flex gap-6 overflow-x-auto">
                    {usageTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          'inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm whitespace-nowrap transition-colors',
                          activeTab === tab.id
                            ? 'border-primary-500 text-slate-100'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                        )}
                      >
                        {tab.id === 'overview' && <Users className="h-4 w-4" />}
                        {tab.id === 'members' && <Users className="h-4 w-4" />}
                        {tab.id === 'games' && <Calendar className="h-4 w-4" />}
                        {tab.id === 'activity' && <Clock3 className="h-4 w-4" />}
                        {tab.id === 'invites' && <UserPlus className="h-4 w-4" />}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </section>

                {activeTab === 'overview' && (
                  <section className="space-y-6">
                    <div className="rounded-xl bg-slate-900/70 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-100">Upcoming Games</h3>
                      </div>
                      {upcomingGames.length > 0 ? (
                        <div className="space-y-3">
                          {upcomingGames.slice(0, 3).map((game) => (
                            <GameCard
                              key={game.id}
                              game={game}
                              variant="dashboardMinimal"
                              onViewDetails={() => router.push(`/games/${game.id}`)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
                          <p className="text-sm font-medium text-slate-200">No upcoming games</p>
                          <p className="mt-1 text-sm text-slate-500">Set up your next matchup and keep momentum going.</p>
                          <div className="mt-4">
                            <GameButton
                              variant="primary"
                              size="sm"
                              onClick={() => router.push(`/games/create?teamId=${teamId}`)}
                            >
                              Schedule your first team game
                            </GameButton>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {activeTab === 'members' && (
                  <section className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-base font-semibold text-slate-100">Roster ({sortedMembers.length})</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Sort</span>
                        <button
                          type="button"
                          onClick={() => setMemberSort('skill')}
                          className={cn('rounded-md px-2 py-1 text-xs', memberSort === 'skill' ? 'bg-slate-800 text-slate-100' : 'text-slate-400')}
                        >
                          Skill
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemberSort('joined')}
                          className={cn('rounded-md px-2 py-1 text-xs', memberSort === 'joined' ? 'bg-slate-800 text-slate-100' : 'text-slate-400')}
                        >
                          Join date
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemberSort('activity')}
                          className={cn('rounded-md px-2 py-1 text-xs', memberSort === 'activity' ? 'bg-slate-800 text-slate-100' : 'text-slate-400')}
                        >
                          Activity
                        </button>
                      </div>
                    </div>

                    {visibleSortedMembers.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {visibleSortedMembers.map((member) => (
                          <article key={member.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-100">
                                  {member.user?.username?.slice(0, 2).toUpperCase() ?? 'P'}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-100">{member.user?.username ?? 'Player'}</p>
                                  <p className="text-xs text-slate-500">Rating {member.user?.rating ?? 0}</p>
                                </div>
                              </div>
                              <span
                                className={cn(
                                  'rounded-full px-2 py-0.5 text-[11px] font-medium',
                                  member.role === 'captain'
                                    ? 'bg-amber-500/15 text-amber-300'
                                    : member.role === 'co_captain'
                                      ? 'bg-sky-500/15 text-sky-300'
                                      : 'bg-slate-800 text-slate-300'
                                )}
                              >
                                {member.role === 'captain' ? 'Captain' : member.role === 'co_captain' ? 'Co-captain' : 'Member'}
                              </span>
                            </div>
                            <div className="space-y-1 text-xs text-slate-500">
                              <p>Skill level: {member.user?.skillLevel ?? 0}</p>
                              <p>Joined: {formatDate(member.joinedAt)}</p>
                              <p>Activity score: {activityCountByUser.get(member.userId) ?? 0}</p>
                            </div>

                            {isCaptain && member.role !== 'captain' && (
                              <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <GameButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateMemberRole(
                                        member,
                                        member.role === 'co_captain' ? 'member' : 'co_captain'
                                      )
                                    }
                                    loading={updateMemberRoleMutation.isPending}
                                  >
                                    {member.role === 'co_captain' ? 'Set member' : 'Promote'}
                                  </GameButton>
                                  <GameButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleTransferCaptain(member)}
                                    loading={transferCaptainMutation.isPending}
                                  >
                                    Transfer
                                  </GameButton>
                                </div>
                                <GameButton
                                  variant="danger"
                                  size="sm"
                                  fullWidth
                                  onClick={() => handleKickMember(member)}
                                  loading={removeMemberMutation.isPending}
                                >
                                  Kick player
                                </GameButton>
                              </div>
                            )}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-700 p-5 text-sm text-slate-500">
                        No members found. Invite players to build your roster.
                      </div>
                    )}

                    {visibleMembers < sortedMembers.length && (
                      <div className="pt-1">
                        <GameButton variant="ghost" size="sm" onClick={() => setVisibleMembers((value) => value + 8)}>
                          Load more members
                        </GameButton>
                      </div>
                    )}
                  </section>
                )}

                {activeTab === 'games' && (
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-100">Team games</h3>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                        <h4 className="mb-3 text-sm font-semibold text-slate-100">Upcoming</h4>
                        {upcomingGames.length > 0 ? (
                          <div className="space-y-3">
                            {upcomingGames.map((game) => (
                              <GameCard
                                key={game.id}
                                game={game}
                                variant="dashboardMinimal"
                                onViewDetails={() => router.push(`/games/${game.id}`)}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No upcoming games. Schedule your first game.</p>
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                        <h4 className="mb-3 text-sm font-semibold text-slate-100">Past results</h4>
                        {recentResults.length > 0 ? (
                          <div className="space-y-3">
                            {recentResults.map((game) => (
                              <div key={game.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-medium text-slate-100">
                                    {game.hostTeam?.name ?? 'Host'} vs {game.opponentTeam?.name ?? 'Opponent'}
                                  </p>
                                  <span className="text-xs text-slate-500">{formatDate(game.scheduledAt)}</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-400">
                                  Score: {typeof game.hostScore === 'number' && typeof game.opponentScore === 'number'
                                    ? `${game.hostScore} - ${game.opponentScore}`
                                    : 'Not recorded'}
                                </p>
                                <p className="text-xs text-slate-500">Location: {game.court?.name ?? 'Unknown court'}</p>
                                <p className="text-xs text-slate-500">
                                  Rating change: {typeof game.hostRatingChange === 'number' || typeof game.opponentRatingChange === 'number'
                                    ? `${game.hostTeamId === teamId ? game.hostRatingChange ?? 0 : game.opponentRatingChange ?? 0}`
                                    : 'N/A'}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No past team results yet.</p>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {activeTab === 'activity' && (
                  <section className="space-y-3">
                    <h3 className="text-base font-semibold text-slate-100">Team activity</h3>
                    {activityItems.length > 0 ? (
                      activityItems.map((item) => (
                        <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                          <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            <span>{formatDateTime(item.createdAt)}</span>
                            <span>•</span>
                            <span>{activityLabelByType[item.type]}</span>
                          </div>
                          <p className="text-sm text-slate-200">{item.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-700 p-5 text-sm text-slate-500">
                        No activity yet. Actions from members and games will show here.
                      </div>
                    )}
                  </section>
                )}

                {activeTab === 'invites' && canManage && (
                  <section className="space-y-5">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <h3 className="mb-3 text-sm font-semibold text-slate-100">Invite by username</h3>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <input
                            value={inviteUsername}
                            onChange={(e) => setInviteUsername(e.target.value)}
                            placeholder="Enter username"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-primary-500"
                          />
                        </div>
                        <GameButton
                          variant="primary"
                          size="sm"
                          onClick={handleInviteByUsername}
                          loading={sendInviteMutation.isPending}
                          icon={<UserPlus className="h-4 w-4" />}
                        >
                          Send invite
                        </GameButton>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <h3 className="mb-3 text-sm font-semibold text-slate-100">Pending invites ({pendingInvites.length})</h3>
                      {pendingInvites.length > 0 ? (
                        <div className="space-y-2">
                          {pendingInvites.map((invite) => (
                            <div key={invite.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                              <div>
                                <p className="text-sm text-slate-100">{invite.invitedUser?.username ?? 'Unknown user'}</p>
                                <p className="text-xs text-slate-500">
                                  Code: <span className="font-mono">{invite.inviteCode}</span> • expires {formatDate(invite.expiresAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-300">
                                  {invite.status}
                                </span>
                                <GameButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelInvite(invite)}
                                  loading={updateInviteStatusMutation.isPending}
                                >
                                  Cancel
                                </GameButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No pending invites.</p>
                      )}
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


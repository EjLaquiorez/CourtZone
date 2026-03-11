'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Trophy,
  UserPlus,
  MessageCircle,
  Share2,
  Edit3,
  X,
  Check,
  AlertCircle,
  Crown
} from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav, MobileQuickAction } from '@/components/layout/mobile-nav';
import { GameButton } from '@/components/ui/game-button';
import { StatCard } from '@/components/ui/stat-card';
import { PlayerCard } from '@/components/ui/player-card';
import { GameChat } from '@/components/game/game-chat';
import { GameCompletionForm } from '@/components/games/game-completion-form';
import { cn, formatDate, formatTime } from '@/lib/utils';
import {
  useCurrentUser,
  useGame,
  useJoinGame,
  useLeaveGame,
  useGameParticipants,
  useCompleteGame
} from '@/lib/hooks/use-api';
import { GameStatus, User } from '@/types';

const fallbackUser = {
  username: 'Player',
  avatar: '',
  rating: 0
};

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.id as string;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'chat' | 'details'>('overview');
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  // API hooks
  const { data: currentUserResponse } = useCurrentUser();
  const currentUser = currentUserResponse?.data;

  const { data: gameResponse, isLoading: gameLoading } = useGame(gameId);
  const game = gameResponse?.data;

  const joinGameMutation = useJoinGame({
    onSuccess: (data) => {
      console.log('Successfully joined game:', data);
    },
    onError: (error) => {
      console.error('Failed to join game:', error);
    }
  });

  const leaveGameMutation = useLeaveGame({
    onSuccess: (data) => {
      console.log('Successfully left game:', data);
    },
    onError: (error) => {
      console.error('Failed to leave game:', error);
    }
  });

  const { data: participantsData, isLoading: participantsLoading } = useGameParticipants(gameId);
  const completeGameMutation = useCompleteGame();

  const participants =
    participantsData?.data?.participants?.map((p: any) => ({
      id: p.id,
      userId: p.userId,
      user: p.user
    })) || [];

  const organizer: User | undefined = game?.organizer;

  const isUserParticipant = useMemo(() => {
    if (!currentUser) return false;
    return participants.some((p) => p.userId === currentUser.id);
  }, [currentUser, participants]);

  const isOrganizer = Boolean(currentUser && game && game.organizerId === currentUser.id);

  type UserRole = 'organizer' | 'participant' | 'none';
  const userRole: UserRole = isOrganizer ? 'organizer' : isUserParticipant ? 'participant' : 'none';

  const handleJoinGame = () => {
    joinGameMutation.mutate(gameId);
  };

  const handleLeaveGame = () => {
    leaveGameMutation.mutate(gameId);
  };

  const handleEditGame = () => {
    console.log('Editing game:', gameId);
    // Navigate to edit page
  };

  const handleCancelGame = () => {
    console.log('Cancelling game:', gameId);
    // Implement cancel game logic
  };

  const handleShare = () => {
    const safeGame = game;
    const gameTitle = safeGame
      ? `${safeGame.gameType} Game at ${safeGame.court?.name ?? 'Court'}`
      : 'CourtZone Game';
    if (navigator.share) {
      navigator.share({
        title: gameTitle,
        text: safeGame
          ? `Join me for a ${safeGame.gameType} game at ${safeGame.court?.name ?? 'this court'}`
          : 'Join me for a game on CourtZone',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Capacity & timing
  const maxPlayers = game?.maxPlayers ?? 10;
  const currentPlayers = participants.length;
  const spotsRemaining = maxPlayers - currentPlayers;
  const isGameFull = spotsRemaining <= 0;
  const scheduledTime = (game as any)?.scheduledAt || (game as any)?.scheduledTime;
  const isGameSoon =
    scheduledTime &&
    new Date(scheduledTime).getTime() - Date.now() < 2 * 60 * 60 * 1000; // 2 hours

  const canShowPostGameActions =
    isOrganizer &&
    game &&
    (game.status === 'scheduled' || game.status === 'in_progress') &&
    scheduledTime &&
    new Date(scheduledTime).getTime() <= Date.now();

  const handleQuickComplete = (resolutionType: 'completed' | 'no_show_issues') => {
    if (!game) return;
    const confirmMessage =
      resolutionType === 'no_show_issues'
        ? 'Mark this game as completed with no-show issues?'
        : 'Mark this game as completed?';

    if (!window.confirm(confirmMessage)) return;

    completeGameMutation.mutate({
      gameId,
      data: { resolutionType }
    });
  };

  const getStatusColor = (status: GameStatus) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400 bg-blue-500/20';
      case 'in_progress': return 'text-court-400 bg-court-500/20';
      case 'completed': return 'text-gray-400 bg-gray-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/20';
      default: return 'text-primary-400 bg-primary-500/20';
    }
  };

  const getStatusIcon = (status: GameStatus) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'completed': return <Trophy className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

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
            user={currentUser || fallbackUser}
            onMenuToggle={() => setMobileSidebarOpen(true)}
          />

          {/* Page Content */}
          <main className="p-4 lg:flex-1 lg:overflow-y-auto lg:p-8">
            {/* Back Button */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GameButton
                variant="ghost"
                size="md"
                onClick={() => window.history.back()}
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Back to Games
              </GameButton>
            </motion.div>

            {/* Game Header */}
            <motion.div
              className="bg-gradient-to-r from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                  {/* Game Icon */}
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center basketball-glow">
                      <span className="text-3xl">🏀</span>
                    </div>
                    {/* Urgency indicator */}
                    {isGameSoon && game?.status === 'scheduled' && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Game Info */}
                  <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">
                      {game?.gameType ?? 'pickup'} Game
                    </h1>
                    <div className="flex items-center space-x-4 text-primary-300 mb-2">
                      {game?.gameType && (
                        <>
                          <span className="text-primary-200 font-medium capitalize">
                            {String(game.gameType).replace('_', ' ')}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      {game && (
                        <span>
                          Skill Level:{' '}
                          {game.skillLevelMin ?? (game as any).minSkillLevel}-
                          {game.skillLevelMax ?? (game as any).maxSkillLevel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-primary-300">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {scheduledTime && formatDate(scheduledTime)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {scheduledTime && formatTime(scheduledTime)}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {currentPlayers}/{maxPlayers} players
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col items-end space-y-3">
                  {/* Status Badge */}
                  <div
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1',
                      game ? getStatusColor(game.status as GameStatus) : 'text-primary-400 bg-primary-500/20'
                    )}
                  >
                    {game && getStatusIcon(game.status as GameStatus)}
                    <span>{game ? String(game.status).replace('_', ' ') : 'loading'}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <GameButton
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      icon={<Share2 className="w-4 h-4" />}
                    />
                    {userRole === 'organizer' && (
                      <>
                        <GameButton
                          variant="secondary"
                          size="sm"
                          onClick={handleEditGame}
                          icon={<Edit3 className="w-4 h-4" />}
                        >
                          Edit
                        </GameButton>
                        {game?.status === 'scheduled' && (
                          <GameButton
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelGame}
                            icon={<X className="w-4 h-4" />}
                          >
                            Cancel
                          </GameButton>
                        )}
                      </>
                    )}
                    {!isUserParticipant && !isGameFull && game?.status === 'scheduled' && (
                      <GameButton
                        variant="primary"
                        size="sm"
                        onClick={handleJoinGame}
                        icon={<UserPlus className="w-4 h-4" />}
                        glow
                      >
                        Join Game
                      </GameButton>
                    )}
                    {isUserParticipant && game?.status === 'scheduled' && (
                      <GameButton
                        variant="ghost"
                        size="sm"
                        onClick={handleLeaveGame}
                      >
                        Leave Game
                      </GameButton>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              className="flex space-x-1 bg-dark-300/50 rounded-lg p-1 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {[
                { id: 'overview', label: 'Overview', icon: Trophy },
                { id: 'participants', label: 'Players', icon: Users },
                { id: 'chat', label: 'Chat', icon: MessageCircle },
                { id: 'details', label: 'Details', icon: MapPin }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white'
                        : 'text-primary-300 hover:text-primary-100 hover:bg-primary-400/10'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </motion.div>

            {/* Warning for game starting soon */}
            {isGameSoon && game?.status === 'scheduled' && (
              <motion.div
                className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center space-x-3 text-yellow-400">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Game starts soon!</p>
                    <p className="text-sm text-yellow-300">Make sure you're ready and know how to get to the court.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Host post-game quick actions */}
            {canShowPostGameActions && (
              <motion.div
                className="mb-6 p-4 bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/30 rounded-lg flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 lg:space-x-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-primary-100 font-medium">Wrap up this game</p>
                    <p className="text-sm text-primary-300">
                      Mark it as completed or note if there were no-show issues. You can add scores and stats after.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <GameButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleQuickComplete('completed')}
                    loading={completeGameMutation.isPending}
                    icon={<Check className="w-4 h-4" />}
                  >
                    Game Completed
                  </GameButton>
                  <GameButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleQuickComplete('no_show_issues')}
                    loading={completeGameMutation.isPending}
                    icon={<AlertCircle className="w-4 h-4" />}
                  >
                    No-Show Issues
                  </GameButton>
                  <GameButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCompletionForm(true)}
                  >
                    Add score & stats
                  </GameButton>
                </div>
              </motion.div>
            )}

            {/* Optional detailed completion form */}
            {showCompletionForm && game && (
              <div className="mb-8">
                <GameCompletionForm
                  gameId={gameId}
                  participants={participants}
                  teams={{
                    hostTeam: game.hostTeam
                      ? { id: game.hostTeam.id, name: game.hostTeam.name }
                      : undefined,
                    opponentTeam: game.opponentTeam
                      ? { id: game.opponentTeam.id, name: game.opponentTeam.name }
                      : undefined
                  }}
                  onComplete={() => setShowCompletionForm(false)}
                  onCancel={() => setShowCompletionForm(false)}
                />
              </div>
            )}

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Game Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Players Joined"
                      value={`${currentPlayers}/${maxPlayers}`}
                      icon={<Users className="w-6 h-6" />}
                      trend={{ direction: 'up', value: 2, label: 'this hour' }}
                    />
                    <StatCard
                      title="Spots Left"
                      value={spotsRemaining}
                      icon={<UserPlus className="w-6 h-6" />}
                      trend={{ direction: spotsRemaining > 3 ? 'neutral' : 'down', value: spotsRemaining, label: 'remaining' }}
                    />
                    <StatCard
                      title="Skill Range"
                      value={
                        game
                          ? `${game.skillLevelMin ?? (game as any).minSkillLevel}-${
                              game.skillLevelMax ?? (game as any).maxSkillLevel
                            }`
                          : '—'
                      }
                      icon={<Star className="w-6 h-6" />}
                      trend={{ direction: 'neutral', value: 0, label: 'balanced' }}
                    />
                    <StatCard
                      title="Duration"
                      value={
                        (game as any)?.duration
                          ? `${(game as any).duration / 60}h`
                          : (game as any)?.durationMinutes
                          ? `${(game as any).durationMinutes / 60}h`
                          : '—'
                      }
                      icon={<Clock className="w-6 h-6" />}
                      trend={{ direction: 'neutral', value: 0, label: 'scheduled' }}
                    />
                  </div>

                  {/* Game Description */}
                  <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                    <h3 className="text-xl font-display font-bold text-white mb-4">About This Game</h3>
                    <p className="text-primary-200 leading-relaxed">
                      {game?.description
                        ? game.description
                        : `Join us for an exciting ${game?.gameType ?? 'pickup'} basketball game${
                            game?.court?.name ? ` at ${game.court.name}` : ''
                          }. This is a great opportunity to meet new players, improve your skills, and enjoy competitive basketball.${
                            game
                              ? ` All skill levels between ${
                                  game.skillLevelMin ?? (game as any).minSkillLevel
                                } and ${game.skillLevelMax ?? (game as any).maxSkillLevel} are welcome!`
                              : ''
                          }`}
                    </p>
                  </div>

                  {/* Court Information */}
                  <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                    <div className="flex items-center space-x-2 mb-4">
                      <MapPin className="w-5 h-5 text-primary-400" />
                      <h3 className="text-xl font-display font-bold text-white">Court Details</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-primary-100 mb-2">
                          {game?.court?.name ?? 'Court'}
                        </h4>
                        <p className="text-sm text-primary-300 mb-4">
                          {game?.court?.address ?? 'Address to be announced'}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-primary-300">
                          {game?.court && (
                            <span className="flex items-center">
                              <span className="mr-1">
                                {game.court.courtType === 'indoor' ? '🏢' : '🌳'}
                              </span>
                              {game.court.courtType === 'indoor' ? 'Indoor' : 'Outdoor'}
                            </span>
                          )}
                          <span>•</span>
                          <span>{game?.court?.surfaceType}</span>
                          <span>•</span>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 mr-1" />
                            {game?.court?.rating ?? 0} ({game?.court?.reviewCount ?? 0})
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className={cn(
                          'flex items-center space-x-2 p-3 rounded-lg',
                          game?.court?.hasLighting
                            ? 'bg-court-500/20 text-court-400'
                            : 'bg-dark-200/50 text-gray-400'
                        )}>
                          <span className="text-lg">💡</span>
                          <span className="text-sm font-medium">Lighting</span>
                        </div>

                        <div className={cn(
                          'flex items-center space-x-2 p-3 rounded-lg',
                          game?.court?.hasParking
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-dark-200/50 text-gray-400'
                        )}>
                          <span className="text-lg">🚗</span>
                          <span className="text-sm font-medium">Parking</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-primary-400/20">
                      <GameButton
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (!game?.court) return;
                          const url = `https://www.google.com/maps/dir//${
                            game.court.latitude
                          },${game.court.longitude}`;
                          window.open(url, '_blank');
                        }}
                        icon={<MapPin className="w-4 h-4" />}
                      >
                        Get Directions
                      </GameButton>
                    </div>
                  </div>

                  {/* Organizer Info */}
                  <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                    <h3 className="text-xl font-display font-bold text-white mb-4">Game Organizer</h3>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {(organizer?.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-bold text-primary-100">
                            {organizer?.username ?? 'Organizer'}
                          </h4>
                          {organizer?.isVerified && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <Crown className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-primary-300">
                          <span>Rating: {organizer?.rating ?? '—'}</span>
                          <span>•</span>
                          <span>Skill Level: {organizer?.skillLevel ?? '—'}/10</span>
                          <span>•</span>
                          <span>Position: {organizer?.position ?? '—'}</span>
                        </div>
                      </div>
                      <GameButton variant="secondary" size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </GameButton>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'participants' && (
                <div className="space-y-6">
                  {/* Participants Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white">
                        Players ({participants.length}/{maxPlayers})
                      </h3>
                      <p className="text-primary-300">
                        {spotsRemaining > 0 ? `${spotsRemaining} spots remaining` : 'Game is full'}
                      </p>
                    </div>

                    {userRole === 'organizer' && (
                      <GameButton variant="secondary" size="sm" icon={<UserPlus className="w-4 h-4" />}>
                        Invite Players
                      </GameButton>
                    )}
                  </div>

                  {/* Player Progress Bar */}
                  <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-medium text-primary-200">Game Capacity</span>
                      <span className="text-sm text-primary-300">
                        {participants.length} of {maxPlayers} players
                      </span>
                    </div>
                    <div className="w-full bg-dark-200 rounded-full h-4">
                      <motion.div
                        className={cn(
                          'h-4 rounded-full transition-all duration-500',
                          isGameFull
                            ? 'bg-court-500'
                            : participants.length / maxPlayers > 0.8
                            ? 'bg-yellow-500'
                            : 'bg-primary-500'
                        )}
                        style={{ width: `${(participants.length / maxPlayers) * 100}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(participants.length / maxPlayers) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-primary-300 mt-2">
                      <span>0 players</span>
                      <span>{maxPlayers} players</span>
                    </div>
                  </div>

                  {/* Participants List */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {participants.map((participant, index) => (
                      <motion.div
                        key={participant.user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-4 border border-primary-400/20 relative">
                          {/* Organizer Crown */}
                          {participant.userId === organizer?.id && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Crown className="w-4 h-4 text-white" />
                            </div>
                          )}

                          <div className="flex items-center space-x-4">
                            {/* Player Avatar */}
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                              {participant.user.username.charAt(0).toUpperCase()}
                            </div>

                            {/* Player Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-bold text-primary-100 truncate">
                                  {participant.user.username}
                                </h4>
                                {participant.user.isVerified && (
                                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Check className="w-2 h-2 text-white" />
                                  </div>
                                )}
                                {participant.userId === organizer?.id && (
                                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                    Organizer
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-3 text-sm text-primary-300">
                                <span>Rating: {participant.user.rating}</span>
                                <span>•</span>
                                <span>Skill: {participant.user.skillLevel}/10</span>
                                <span>•</span>
                                <span>{participant.user.position}</span>
                              </div>

                              {/* City is not included in participant payload; omit for now */}
                              {false && participant.user.city && (
                                <div className="flex items-center space-x-1 text-xs text-primary-400 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{participant.user.city}</span>
                                </div>
                              )}
                            </div>

                            {/* Player Actions */}
                            <div className="flex items-center space-x-2">
                              <GameButton variant="ghost" size="sm">
                                <MessageCircle className="w-4 h-4" />
                              </GameButton>

                              {userRole === 'organizer' && participant.userId !== organizer?.id && (
                                <GameButton variant="ghost" size="sm">
                                  <X className="w-4 h-4" />
                                </GameButton>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Empty Slots */}
                  {spotsRemaining > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-primary-200">
                        Available Spots ({spotsRemaining})
                      </h4>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {Array.from({ length: spotsRemaining }, (_, index) => (
                          <motion.div
                            key={`empty-${index}`}
                            className="bg-gradient-to-br from-dark-300/40 to-dark-400/40 backdrop-blur-sm rounded-xl p-4 border-2 border-dashed border-primary-400/30"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (participants.length + index) }}
                          >
                            <div className="flex items-center justify-center h-20 text-primary-400">
                              <div className="text-center">
                                <UserPlus className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm">Open Spot</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Team Balance Analysis */}
                  <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                    <h4 className="text-lg font-display font-bold text-white mb-4">Team Balance</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Skill Distribution */}
                      <div>
                        <h5 className="font-medium text-primary-200 mb-2">Skill Distribution</h5>
                        <div className="space-y-2">
                          {[
                            { range: '8-10', count: mockParticipants.filter(p => p.skillLevel >= 8).length, color: 'bg-court-500' },
                            { range: '5-7', count: mockParticipants.filter(p => p.skillLevel >= 5 && p.skillLevel < 8).length, color: 'bg-yellow-500' },
                            { range: '1-4', count: mockParticipants.filter(p => p.skillLevel < 5).length, color: 'bg-red-500' }
                          ].map((skill) => (
                            <div key={skill.range} className="flex items-center space-x-2">
                              <div className={cn('w-3 h-3 rounded-full', skill.color)} />
                              <span className="text-sm text-primary-300">{skill.range}: {skill.count} players</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Position Distribution */}
                      <div>
                        <h5 className="font-medium text-primary-200 mb-2">Positions</h5>
                        <div className="space-y-1">
                          {['PG', 'SG', 'SF', 'PF', 'C'].map((position) => {
                            const count = mockParticipants.filter(p => p.position === position).length;
                            return (
                              <div key={position} className="flex justify-between text-sm">
                                <span className="text-primary-300">{position}:</span>
                                <span className="text-primary-100">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Average Stats */}
                      <div>
                        <h5 className="font-medium text-primary-200 mb-2">Team Stats</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-primary-300">Avg Rating:</span>
                            <span className="text-primary-100">
                              {Math.round(mockParticipants.reduce((sum, p) => sum + p.rating, 0) / mockParticipants.length)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-primary-300">Avg Skill:</span>
                            <span className="text-primary-100">
                              {(mockParticipants.reduce((sum, p) => sum + p.skillLevel, 0) / mockParticipants.length).toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-primary-300">Verified:</span>
                            <span className="text-primary-100">
                              {mockParticipants.filter(p => p.isVerified).length}/{mockParticipants.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <GameChat
                  gameId={gameId}
                  currentUser={{
                    id: currentUser?.id || 'current-user',
                    username: currentUser?.username || fallbackUser.username,
                    avatar: currentUser?.avatar || fallbackUser.avatar
                  }}
                  participants={participants.map(p => ({
                    id: p.user.id,
                    username: p.user.username,
                    avatar: p.user.avatar,
                    isOrganizer: p.userId === organizer?.id
                  }))}
                />
              )}

              {activeTab === 'details' && (
                <div className="space-y-8">
                  {/* Game Rules & Guidelines */}
                  <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                    <h3 className="text-xl font-display font-bold text-white mb-4">Game Rules & Guidelines</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-primary-200 mb-2">🏀 Game Format</h4>
                        <ul className="text-sm text-primary-300 space-y-1 ml-4">
                          <li>• Full court 5v5 games</li>
                          <li>• Games to 21 points (win by 2)</li>
                          <li>• Make it, take it rules</li>
                          <li>• Call your own fouls</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-primary-200 mb-2">⚡ What to Bring</h4>
                        <ul className="text-sm text-primary-300 space-y-1 ml-4">
                          <li>• Water bottle (stay hydrated!)</li>
                          <li>• Basketball shoes with good grip</li>
                          <li>• Light and dark colored shirts</li>
                          <li>• Positive attitude and sportsmanship</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-primary-200 mb-2">🤝 Code of Conduct</h4>
                        <ul className="text-sm text-primary-300 space-y-1 ml-4">
                          <li>• Respect all players regardless of skill level</li>
                          <li>• No aggressive or unsportsmanlike behavior</li>
                          <li>• Help newer players improve their game</li>
                          <li>• Clean up after yourself</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Weather & Conditions */}
                  <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                    <h3 className="text-xl font-display font-bold text-white mb-4">Weather & Court Conditions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-primary-200 mb-3">Expected Weather</h4>
                        <div className="flex items-center space-x-4 p-4 bg-dark-200/50 rounded-lg">
                          <div className="text-4xl">☀️</div>
                          <div>
                            <p className="font-medium text-primary-100">Sunny</p>
                            <p className="text-sm text-primary-300">72°F • 0% chance of rain</p>
                            <p className="text-xs text-primary-400">Perfect basketball weather!</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-primary-200 mb-3">Court Status</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-court-500/20 rounded-lg">
                            <span className="text-sm text-court-300">Court Condition</span>
                            <span className="text-sm font-medium text-court-100">Excellent</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg">
                            <span className="text-sm text-blue-300">Lighting</span>
                            <span className="text-sm font-medium text-blue-100">Available</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-primary-500/20 rounded-lg">
                            <span className="text-sm text-primary-300">Parking</span>
                            <span className="text-sm font-medium text-primary-100">Free</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Information */}
                  <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                    <h3 className="text-xl font-display font-bold text-white mb-4">Safety & Emergency Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-primary-200 mb-3">Emergency Contacts</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-primary-300">Emergency:</span>
                            <span className="text-primary-100 font-medium">911</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-primary-300">Organizer:</span>
                            <span className="text-primary-100 font-medium">{mockOrganizer.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-primary-300">Nearest Hospital:</span>
                            <span className="text-primary-100 font-medium">UCLA Medical Center</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-primary-200 mb-3">Nearby Facilities</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🚻</span>
                            <span className="text-primary-300">Restrooms: 50m north of court</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">💧</span>
                            <span className="text-primary-300">Water fountain: Near restrooms</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🍕</span>
                            <span className="text-primary-300">Food: Multiple options on boardwalk</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🚗</span>
                            <span className="text-primary-300">Parking: Street parking available</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Game History */}
                  <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                    <h3 className="text-xl font-display font-bold text-white mb-4">Organizer's Game History</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-dark-200/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary-100 font-accent">47</div>
                        <div className="text-sm text-primary-300">Games Organized</div>
                      </div>
                      <div className="text-center p-4 bg-dark-200/50 rounded-lg">
                        <div className="text-2xl font-bold text-court-400 font-accent">4.8</div>
                        <div className="text-sm text-primary-300">Average Rating</div>
                      </div>
                      <div className="text-center p-4 bg-dark-200/50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400 font-accent">94%</div>
                        <div className="text-sm text-primary-300">Show-up Rate</div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-court-500/10 rounded-lg border border-court-500/30">
                      <p className="text-sm text-court-300">
                        <strong>{mockOrganizer.username}</strong> is a trusted organizer with a great track record of running fun, competitive games. Players consistently rate their games highly for organization and sportsmanship.
                      </p>
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                    <h3 className="text-xl font-display font-bold text-white mb-4">Cancellation Policy</h3>
                    <div className="space-y-3 text-sm text-primary-300">
                      <p>
                        <strong className="text-primary-200">Weather Cancellation:</strong> Game will be cancelled if there's heavy rain or unsafe conditions. All participants will be notified at least 2 hours before game time.
                      </p>
                      <p>
                        <strong className="text-primary-200">Player Cancellation:</strong> Please cancel at least 4 hours before the game to allow others to join. Last-minute cancellations affect the game for everyone.
                      </p>
                      <p>
                        <strong className="text-primary-200">Organizer Cancellation:</strong> In rare cases where the organizer must cancel, all participants will be notified immediately and the game may be rescheduled.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav
        notifications={{
          games: 3
        }}
      />

      {/* Mobile Quick Action Button */}
      <MobileQuickAction />
    </div>
  );
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Users, Star, RotateCcw, Save, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameButton } from '@/components/ui/game-button';
import { PlayerCard } from '@/components/ui/player-card';
import { User, Position } from '@/types';

interface TeamLineupProps {
  team: {
    id: string;
    name: string;
    logo?: string;
    members: Array<{
      id: string;
      user: User;
      position?: Position;
      isStarter: boolean;
      role: 'captain' | 'co_captain' | 'member';
    }>;
  };
  formation?: '5-0' | '4-1' | '3-2' | '2-3';
  interactive?: boolean;
  onPlayerMove?: (playerId: string, position: Position, isStarter: boolean) => void;
  onSaveLineup?: (lineup: any) => void;
  showSubstitutes?: boolean;
  className?: string;
}

const COURT_POSITIONS = {
  PG: { x: 50, y: 85, label: 'Point Guard' },
  SG: { x: 25, y: 65, label: 'Shooting Guard' },
  SF: { x: 75, y: 65, label: 'Small Forward' },
  PF: { x: 25, y: 35, label: 'Power Forward' },
  C: { x: 50, y: 25, label: 'Center' }
};

export function TeamLineup({
  team,
  formation = '5-0',
  interactive = false,
  onPlayerMove,
  onSaveLineup,
  showSubstitutes = true,
  className
}: TeamLineupProps) {
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [lineup, setLineup] = useState(() => {
    const starters = team.members.filter(m => m.isStarter);
    const bench = team.members.filter(m => !m.isStarter);
    return { starters, bench };
  });

  const handleDragStart = (playerId: string) => {
    if (!interactive) return;
    setDraggedPlayer(playerId);
  };

  const handleDragEnd = () => {
    setDraggedPlayer(null);
  };

  const handlePositionDrop = (position: Position) => {
    if (!draggedPlayer || !onPlayerMove) return;
    
    // Find the player being moved
    const allMembers = [...lineup.starters, ...lineup.bench];
    const player = allMembers.find(m => m.id === draggedPlayer);
    if (!player) return;

    // Check if position is already occupied
    const currentPlayerInPosition = lineup.starters.find(s => s.position === position);
    
    // Update lineup
    const newStarters = lineup.starters.filter(s => s.id !== draggedPlayer);
    const newBench = lineup.bench.filter(b => b.id !== draggedPlayer);

    // If position was occupied, move that player to bench
    if (currentPlayerInPosition) {
      newBench.push({ ...currentPlayerInPosition, isStarter: false });
    }

    // Add dragged player to starting position
    newStarters.push({ ...player, position, isStarter: true });

    setLineup({ starters: newStarters, bench: newBench });
    onPlayerMove(draggedPlayer, position, true);
    setDraggedPlayer(null);
  };

  const handleBenchDrop = (playerId: string) => {
    if (!onPlayerMove) return;

    const player = lineup.starters.find(s => s.id === playerId);
    if (!player) return;

    const newStarters = lineup.starters.filter(s => s.id !== playerId);
    const newBench = [...lineup.bench, { ...player, isStarter: false }];

    setLineup({ starters: newStarters, bench: newBench });
    onPlayerMove(playerId, player.position!, false);
  };

  const getPlayerAtPosition = (position: Position) => {
    return lineup.starters.find(s => s.position === position);
  };

  const calculateTeamChemistry = () => {
    // Simple chemistry calculation based on skill level variance
    const skills = lineup.starters.map(s => s.user.skillLevel);
    const avgSkill = skills.reduce((a, b) => a + b, 0) / skills.length;
    const variance = skills.reduce((acc, skill) => acc + Math.pow(skill - avgSkill, 2), 0) / skills.length;
    return Math.max(0, 100 - variance * 10);
  };

  const teamChemistry = calculateTeamChemistry();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            {team.logo ? (
              <img src={team.logo} alt={team.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <Users className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">{team.name}</h2>
            <p className="text-sm text-primary-300">
              {lineup.starters.length}/5 starters • Chemistry: {teamChemistry.toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {interactive && (
            <>
              <GameButton
                variant="secondary"
                size="sm"
                onClick={() => setEditMode(!editMode)}
                icon={<Edit3 className="w-4 h-4" />}
              >
                {editMode ? 'View' : 'Edit'}
              </GameButton>
              <GameButton
                variant="ghost"
                size="sm"
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Reset
              </GameButton>
              <GameButton
                variant="primary"
                size="sm"
                onClick={() => onSaveLineup?.(lineup)}
                icon={<Save className="w-4 h-4" />}
              >
                Save
              </GameButton>
            </>
          )}
        </div>
      </div>

      {/* Basketball Court */}
      <div className="relative">
        <motion.div
          className="relative bg-gradient-to-b from-court-600/20 to-court-500/20 rounded-xl p-8 border-2 border-court-400/30"
          style={{ aspectRatio: '1.5/1', minHeight: '400px' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Court markings */}
          <div className="absolute inset-0 opacity-20">
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white rounded-full" />
            {/* Three-point line */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-32 border-2 border-white rounded-t-full border-b-0" />
            {/* Free throw circle */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-16 h-16 border-2 border-white rounded-full" />
          </div>

          {/* Position slots */}
          {Object.entries(COURT_POSITIONS).map(([position, coords]) => {
            const player = getPlayerAtPosition(position as Position);
            const isEmpty = !player;

            return (
              <motion.div
                key={position}
                className={cn(
                  'absolute w-20 h-20 rounded-full border-2 border-dashed transition-all duration-200',
                  isEmpty 
                    ? 'border-primary-400/50 bg-primary-400/10' 
                    : 'border-primary-500 bg-primary-500/20',
                  interactive && 'hover:border-primary-400 hover:bg-primary-400/20'
                )}
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handlePositionDrop(position as Position)}
                whileHover={interactive ? { scale: 1.05 } : {}}
              >
                {/* Position label */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-primary-300">
                  {position}
                </div>

                {/* Player */}
                {player && (
                  <motion.div
                    className="w-full h-full cursor-move"
                    draggable={interactive && editMode}
                    onDragStart={() => handleDragStart(player.id)}
                    onDragEnd={handleDragEnd}
                    whileHover={{ scale: 1.1 }}
                    whileDrag={{ scale: 1.2, zIndex: 50 }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-lg">
                      {player.user.avatar ? (
                        <img 
                          src={player.user.avatar} 
                          alt={player.user.username} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        player.user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    
                    {/* Player name */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-primary-100 whitespace-nowrap">
                      {player.user.username}
                    </div>

                    {/* Captain indicator */}
                    {player.role === 'captain' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs">
                        👑
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Empty slot indicator */}
                {isEmpty && (
                  <div className="w-full h-full flex items-center justify-center text-primary-400">
                    <Users className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Drag overlay */}
          <AnimatePresence>
            {draggedPlayer && (
              <motion.div
                className="absolute inset-0 bg-primary-500/10 rounded-xl border-2 border-primary-500 border-dashed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-300 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Drop player on position</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Team Chemistry Indicator */}
      <div className="bg-dark-300/50 rounded-lg p-4 border border-primary-400/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary-200">Team Chemistry</span>
          <span className="text-sm font-bold text-primary-400">{teamChemistry.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-dark-200 rounded-full h-2">
          <motion.div
            className={cn(
              'h-2 rounded-full transition-all duration-500',
              teamChemistry >= 80 ? 'bg-court-500' :
              teamChemistry >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${teamChemistry}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${teamChemistry}%` }}
          />
        </div>
        <p className="text-xs text-primary-300 mt-1">
          {teamChemistry >= 80 ? 'Excellent chemistry! This lineup works well together.' :
           teamChemistry >= 60 ? 'Good chemistry. Consider adjusting for better balance.' :
           'Poor chemistry. Try balancing skill levels and positions.'}
        </p>
      </div>

      {/* Bench Players */}
      {showSubstitutes && lineup.bench.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-display font-bold text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Bench Players ({lineup.bench.length})
          </h3>
          
          <div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-dark-300/30 rounded-lg border-2 border-dashed border-primary-400/30"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedPlayer) {
                handleBenchDrop(draggedPlayer);
              }
            }}
          >
            {lineup.bench.map((member) => (
              <motion.div
                key={member.id}
                draggable={interactive && editMode}
                onDragStart={() => handleDragStart(member.id)}
                onDragEnd={handleDragEnd}
                className="cursor-move"
                whileHover={{ scale: 1.02 }}
                whileDrag={{ scale: 1.05, zIndex: 50 }}
              >
                <PlayerCard 
                  player={member.user} 
                  variant="compact"
                  className="bg-dark-200/50"
                />
              </motion.div>
            ))}
            
            {lineup.bench.length === 0 && (
              <div className="col-span-full text-center py-8 text-primary-300">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No bench players</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

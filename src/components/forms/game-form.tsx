'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Lock,
  Globe,
  Save,
  X,
  Search,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameButton } from '@/components/ui/game-button';
import { InteractiveSkillSelector } from '@/components/ui/skill-rating';
import { LoadingOverlay } from '@/components/ui/loading';
import { useToastHelpers } from '@/components/ui/toast';
import { schemas, validateForm } from '@/lib/validation';
import { GameForm, Court } from '@/types';

interface GameFormProps {
  initialData?: Partial<GameForm>;
  courts: Court[];
  onSubmit: (data: GameForm) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function GameCreationForm({
  initialData,
  courts,
  onSubmit,
  onCancel,
  isLoading = false,
  className
}: GameFormProps) {
  const [formData, setFormData] = useState<GameForm>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    gameType: initialData?.gameType || 'pickup',
    courtId: initialData?.courtId || '',
    scheduledAt: initialData?.scheduledAt || '',
    duration: initialData?.duration || 120, // 2 hours default
    maxPlayers: initialData?.maxPlayers || 10,
    skillLevel: initialData?.skillLevel || { min: 1, max: 10 },
    isPrivate: initialData?.isPrivate ?? false,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courtSearch, setCourtSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToastHelpers();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
               type === 'number' ? parseInt(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillLevelChange = (type: 'min' | 'max', level: number) => {
    setFormData(prev => ({
      ...prev,
      skillLevel: {
        ...prev.skillLevel,
        [type]: level
      }
    }));
  };

  const validateFormData = (): boolean => {
    // Transform form data to match validation schema
    const validationData = {
      title: formData.title,
      description: formData.description,
      courtId: formData.courtId,
      date: formData.scheduledAt.split('T')[0],
      time: formData.scheduledAt.split('T')[1],
      maxPlayers: formData.maxPlayers,
      skillLevel: 'intermediate', // Map skill level range to enum
      gameType: formData.gameType,
      isPrivate: formData.isPrivate,
    };

    const result = validateForm(schemas.game.create, validationData);

    if (!result.success && result.errors) {
      setErrors(result.errors);

      // Show toast for validation errors
      const firstError = Object.values(result.errors)[0];
      toast.error('Validation Error', firstError);

      return false;
    }

    // Additional custom validations
    const customErrors: Record<string, string> = {};

    if (formData.skillLevel.min > formData.skillLevel.max) {
      customErrors.skillLevel = 'Minimum skill level cannot be higher than maximum';
    }

    if (Object.keys(customErrors).length > 0) {
      setErrors(customErrors);
      toast.error('Validation Error', Object.values(customErrors)[0]);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFormData()) return;

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      toast.gameCreated(formData.title);
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game', 'Please try again or contact support if the problem persists.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCourts = courts.filter(court =>
    court.name.toLowerCase().includes(courtSearch.toLowerCase()) ||
    court.address.toLowerCase().includes(courtSearch.toLowerCase())
  );

  const selectedCourt = courts.find(court => court.id === formData.courtId);

  // Generate suggested times
  const getSuggestedTimes = () => {
    const now = new Date();
    const suggestions = [];

    // Today evening
    const todayEvening = new Date(now);
    todayEvening.setHours(18, 0, 0, 0);
    if (todayEvening > now) {
      suggestions.push({ label: 'Today 6:00 PM', value: todayEvening.toISOString().slice(0, 16) });
    }

    // Tomorrow morning
    const tomorrowMorning = new Date(now);
    tomorrowMorning.setDate(now.getDate() + 1);
    tomorrowMorning.setHours(9, 0, 0, 0);
    suggestions.push({ label: 'Tomorrow 9:00 AM', value: tomorrowMorning.toISOString().slice(0, 16) });

    // Tomorrow evening
    const tomorrowEvening = new Date(now);
    tomorrowEvening.setDate(now.getDate() + 1);
    tomorrowEvening.setHours(18, 0, 0, 0);
    suggestions.push({ label: 'Tomorrow 6:00 PM', value: tomorrowEvening.toISOString().slice(0, 16) });

    // This weekend
    const weekend = new Date(now);
    const daysUntilSaturday = 6 - now.getDay();
    weekend.setDate(now.getDate() + daysUntilSaturday);
    weekend.setHours(10, 0, 0, 0);
    suggestions.push({ label: 'This Saturday 10:00 AM', value: weekend.toISOString().slice(0, 16) });

    return suggestions;
  };

  return (
    <LoadingOverlay
      isLoading={isSubmitting}
      text="Creating your game..."
      className={className}
    >
      <motion.div
        className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-8 border border-primary-400/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Create a Game 🏀
          </h2>
          <p className="text-primary-200">
            Organize a basketball game and invite players to join
          </p>
        </div>

        {/* Game Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-primary-200 mb-2">
            Game Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            className={cn(
              "block w-full px-4 py-3 border rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "transition-all duration-200",
              errors.title ? "border-red-500/50" : "border-primary-400/30"
            )}
            placeholder="e.g., Friday Night Pickup Game"
            maxLength={100}
          />
          {errors.title && (
            <motion.p
              className="mt-1 text-sm text-red-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.title}
            </motion.p>
          )}
        </div>

        {/* Game Type and Privacy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="gameType" className="block text-sm font-medium text-primary-200 mb-2">
              Game Type
            </label>
            <select
              id="gameType"
              name="gameType"
              value={formData.gameType}
              onChange={handleInputChange}
              className="block w-full px-4 py-3 border border-primary-400/30 rounded-lg bg-dark-200/50 text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="pickup">Pickup Game</option>
              <option value="scrimmage">Scrimmage</option>
              <option value="tournament">Tournament</option>
              <option value="practice">Practice</option>
              <option value="league">League Game</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-200 mb-3">
              Game Privacy
            </label>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="isPrivate"
                  checked={!formData.isPrivate}
                  onChange={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                  className="sr-only"
                />
                <div className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-all",
                  !formData.isPrivate
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-primary-400/30 bg-dark-200/30 hover:border-primary-400/50"
                )}>
                  <Globe className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-sm font-medium text-primary-100">Public</p>
                    <p className="text-xs text-primary-300">Anyone can find and join</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                  className="sr-only"
                />
                <div className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-all",
                  formData.isPrivate
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-primary-400/30 bg-dark-200/30 hover:border-primary-400/50"
                )}>
                  <Lock className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-sm font-medium text-primary-100">Private</p>
                    <p className="text-xs text-primary-300">Invite only</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Court Selection */}
        <div>
          <label className="block text-sm font-medium text-primary-200 mb-2">
            Court Location *
          </label>

          {/* Court Search */}
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-primary-400" />
            </div>
            <input
              type="text"
              value={courtSearch}
              onChange={(e) => setCourtSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-primary-400/30 rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Search courts..."
            />
          </div>

          {/* Court List */}
          <div className="max-h-48 overflow-y-auto space-y-2 border border-primary-400/30 rounded-lg p-2 bg-dark-200/30">
            {filteredCourts.map((court) => (
              <label key={court.id} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="courtId"
                  value={court.id}
                  checked={formData.courtId === court.id}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-all w-full",
                  formData.courtId === court.id
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-transparent hover:border-primary-400/50 hover:bg-primary-400/5"
                )}>
                  <div className="w-10 h-10 bg-gradient-to-br from-court-500 to-court-600 rounded-full flex items-center justify-center">
                    <span className="text-sm">{court.courtType === 'indoor' ? '🏢' : '🌳'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary-100 truncate">{court.name}</p>
                    <p className="text-sm text-primary-300 truncate">{court.address}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {errors.courtId && (
            <motion.p
              className="mt-1 text-sm text-red-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.courtId}
            </motion.p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-primary-200 mb-2">
              Date & Time *
            </label>
            <input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={handleInputChange}
              min={new Date().toISOString().slice(0, 16)}
              className={cn(
                "block w-full px-4 py-3 border rounded-lg bg-dark-200/50 text-primary-100",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                "transition-all duration-200",
                errors.scheduledAt ? "border-red-500/50" : "border-primary-400/30"
              )}
            />
            {errors.scheduledAt && (
              <motion.p
                className="mt-1 text-sm text-red-400"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.scheduledAt}
              </motion.p>
            )}

            {/* Quick Time Suggestions */}
            <div className="mt-2">
              <p className="text-xs text-primary-300 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {getSuggestedTimes().map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, scheduledAt: suggestion.value }))}
                    className="px-2 py-1 text-xs bg-primary-500/20 text-primary-300 rounded hover:bg-primary-500/30 transition-colors"
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-primary-200 mb-2">
              Duration (minutes)
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="block w-full px-4 py-3 border border-primary-400/30 rounded-lg bg-dark-200/50 text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={150}>2.5 hours</option>
              <option value={180}>3 hours</option>
              <option value={240}>4 hours</option>
            </select>
          </div>
        </div>

        {/* Players and Skill Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="maxPlayers" className="block text-sm font-medium text-primary-200 mb-2">
              Maximum Players
            </label>
            <input
              id="maxPlayers"
              name="maxPlayers"
              type="number"
              min="2"
              max="20"
              value={formData.maxPlayers}
              onChange={handleInputChange}
              className={cn(
                "block w-full px-4 py-3 border rounded-lg bg-dark-200/50 text-primary-100",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                "transition-all duration-200",
                errors.maxPlayers ? "border-red-500/50" : "border-primary-400/30"
              )}
            />
            {errors.maxPlayers && (
              <motion.p
                className="mt-1 text-sm text-red-400"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.maxPlayers}
              </motion.p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-200 mb-2">
              Skill Level Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <InteractiveSkillSelector
                level={formData.skillLevel.min}
                onChange={(level) => handleSkillLevelChange('min', level)}
                label="Min"
                size="sm"
              />
              <InteractiveSkillSelector
                level={formData.skillLevel.max}
                onChange={(level) => handleSkillLevelChange('max', level)}
                label="Max"
                size="sm"
              />
            </div>
            {errors.skillLevel && (
              <motion.p
                className="mt-1 text-sm text-red-400"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.skillLevel}
              </motion.p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-primary-200 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="block w-full px-4 py-3 border border-primary-400/30 rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Add any additional details about the game, rules, or requirements..."
            maxLength={500}
          />
          <p className="text-xs text-primary-300 mt-1">
            {formData.description?.length || 0}/500
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-primary-400/20">
          {onCancel && (
            <GameButton
              type="button"
              variant="secondary"
              size="lg"
              onClick={onCancel}
              className="sm:flex-1"
              icon={<X className="w-5 h-5" />}
            >
              Cancel
            </GameButton>
          )}

          <GameButton
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting || isLoading}
            glow
            className="sm:flex-1"
            icon={<Save className="w-5 h-5" />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Game...' : 'Create Game'}
          </GameButton>
        </div>
      </form>
      </motion.div>
    </LoadingOverlay>
  );
}

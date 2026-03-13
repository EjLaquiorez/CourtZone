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
      scheduledAt: formData.scheduledAt,
      duration: formData.duration,
      maxPlayers: formData.maxPlayers,
      skillLevel: formData.skillLevel,
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
        className={cn(
          "relative mx-auto flex h-[100vh] w-full flex-col overflow-hidden border border-primary-400/30 bg-gradient-to-br from-dark-400/90 to-dark-500/90 shadow-basketball",
          "sm:h-auto sm:max-h-[90vh] sm:rounded-2xl",
          "lg:w-[min(1100px,calc(100vw-2rem))] lg:max-w-none"
        )}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Header */}
          <div className="flex flex-col gap-1 px-4 pt-4 sm:px-6 sm:pt-5">
            <h2 className="text-[20px] font-display font-semibold text-white">
              Create a game
            </h2>
            <p className="text-xs text-primary-300">
              Fast setup. Minimal scrolling on desktop.
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 pt-4 sm:px-6 sm:pb-4">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
              {/* LEFT: Primary form */}
              <section className="space-y-4 rounded-xl border border-primary-400/15 bg-dark-200/20 p-4">
                {/* Game title */}
                <div>
                  <label htmlFor="title" className="mb-1 block text-xs font-medium text-primary-200">
                    Game title *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={cn(
                      "block w-full rounded-lg border border-primary-400/30 bg-dark-200/60 px-3 py-2.5 text-sm text-primary-100 placeholder-primary-300",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                      errors.title && "border-red-500/50"
                    )}
                    placeholder="e.g., Friday night pickup"
                    maxLength={100}
                  />
                  {errors.title && (
                    <motion.p
                      className="mt-1 text-xs text-red-400"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.title}
                    </motion.p>
                  )}
                </div>

                {/* Game type */}
                <div>
                  <label htmlFor="gameType" className="mb-1 block text-xs font-medium text-primary-200">
                    Game type
                  </label>
                  <select
                    id="gameType"
                    name="gameType"
                    value={formData.gameType}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-primary-400/30 bg-dark-200/60 px-3 py-2.5 text-sm text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pickup">Pickup Game</option>
                    <option value="scrimmage">Scrimmage</option>
                    <option value="tournament">Tournament</option>
                    <option value="practice">Practice</option>
                  </select>
                </div>

                {/* Privacy */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-primary-200">
                    Game privacy
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isPrivate"
                        checked={!formData.isPrivate}
                        onChange={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                        className="sr-only"
                      />
                      <div className={cn(
                        "flex w-full items-center space-x-3 rounded-lg border px-3 py-2.5 text-xs transition-all",
                        !formData.isPrivate
                          ? "border-primary-500 bg-primary-500/10"
                          : "border-primary-400/30 bg-dark-200/30 hover:border-primary-400/50"
                      )}>
                        <Globe className="w-5 h-5 text-primary-400" />
                        <div>
                          <p className="text-[13px] font-medium text-primary-100">Public</p>
                          <p className="text-[11px] text-primary-300">Anyone can join</p>
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
                        "flex w-full items-center space-x-3 rounded-lg border px-3 py-2.5 text-xs transition-all",
                        formData.isPrivate
                          ? "border-primary-500 bg-primary-500/10"
                          : "border-primary-400/30 bg-dark-200/30 hover:border-primary-400/50"
                      )}>
                        <Lock className="w-5 h-5 text-primary-400" />
                        <div>
                          <p className="text-[13px] font-medium text-primary-100">Private</p>
                          <p className="text-[11px] text-primary-300">Invite only</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Court selection */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-primary-200">
                    Court location *
                  </label>
                  <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-5 w-5 text-primary-400" />
                    </div>
                    <input
                      type="text"
                      value={courtSearch}
                      onChange={(e) => setCourtSearch(e.target.value)}
                      className="block w-full rounded-lg border border-primary-400/30 bg-dark-200/60 py-2 pl-10 pr-3 text-sm text-primary-100 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Search courts..."
                    />
                  </div>

                  <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-primary-400/30 bg-dark-200/30 p-2">
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
                          "flex w-full items-center space-x-3 rounded-lg border p-3 transition-all",
                          formData.courtId === court.id
                            ? "border-primary-500 bg-primary-500/10"
                            : "border-transparent hover:border-primary-400/50 hover:bg-primary-400/5"
                        )}>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-court-500 to-court-600">
                            <span className="text-sm">{court.courtType === 'indoor' ? '🏢' : '🌳'}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-primary-100">{court.name}</p>
                            <p className="truncate text-sm text-primary-300">{court.address}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {errors.courtId && (
                    <motion.p
                      className="mt-1 text-xs text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.courtId}
                    </motion.p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="mb-1 block text-xs font-medium text-primary-200">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="block w-full resize-none rounded-lg border border-primary-400/30 bg-dark-200/60 px-3 py-2.5 text-sm text-primary-100 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Extra details, rules, or requirements..."
                    maxLength={500}
                  />
                  <p className="mt-1 text-[11px] text-primary-300">
                    {formData.description?.length || 0}/500
                  </p>
                </div>
              </section>

              {/* RIGHT: Game configuration */}
              <section className="space-y-4 rounded-xl border border-primary-400/15 bg-dark-200/20 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div>
                    <label htmlFor="scheduledAt" className="mb-1 block text-xs font-medium text-primary-200">
                      Date & time *
                    </label>
                    <input
                      id="scheduledAt"
                      name="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={handleInputChange}
                      min={new Date().toISOString().slice(0, 16)}
                      className={cn(
                        "block w-full rounded-lg border bg-dark-200/60 px-3 py-2.5 text-sm text-primary-100",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                        errors.scheduledAt ? "border-red-500/50" : "border-primary-400/30"
                      )}
                    />
                    {errors.scheduledAt && (
                      <motion.p
                        className="mt-1 text-xs text-red-400"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.scheduledAt}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="duration" className="mb-1 block text-xs font-medium text-primary-200">
                      Duration
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-primary-400/30 bg-dark-200/60 px-3 py-2.5 text-sm text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
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

                {/* Quick suggestions */}
                <div>
                  <p className="mb-1 text-[11px] text-primary-300">Quick suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {getSuggestedTimes().map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, scheduledAt: suggestion.value }))}
                        className="rounded px-2 py-1 text-xs bg-primary-500/20 text-primary-300 hover:bg-primary-500/30 transition-colors"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div>
                    <label htmlFor="maxPlayers" className="mb-1 block text-xs font-medium text-primary-200">
                      Maximum players
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
                        "block w-full rounded-lg border bg-dark-200/60 px-3 py-2.5 text-sm text-primary-100",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                        errors.maxPlayers ? "border-red-500/50" : "border-primary-400/30"
                      )}
                    />
                    {errors.maxPlayers && (
                      <motion.p
                        className="mt-1 text-xs text-red-400"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.maxPlayers}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-primary-200">
                      Skill level (1–10)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
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
                        className="mt-1 text-xs text-red-400"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.skillLevel}
                      </motion.p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>

        {/* Sticky footer buttons */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-primary-400/20 bg-gradient-to-t from-dark-900 via-dark-900/95 to-dark-900/80 px-4 py-3 sm:px-6">
          {onCancel && (
            <GameButton
              type="button"
              variant="secondary"
              size="md"
              onClick={onCancel}
              className="h-10 w-[140px]"
              icon={<X className="w-4 h-4" />}
            >
              Cancel
            </GameButton>
          )}

          <GameButton
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting || isLoading}
            glow
            className="h-10 w-[170px]"
            icon={<Save className="w-4 h-4" />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating…' : 'Create game'}
          </GameButton>
        </div>
        </form>
      </motion.div>
    </LoadingOverlay>
  );
}

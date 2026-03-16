'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Upload, Users, Lock, Globe, Star, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameButton } from '@/components/ui/game-button';
import { InteractiveSkillSelector } from '@/components/ui/skill-rating';
import { TeamForm } from '@/types';

interface TeamFormProps {
  initialData?: Partial<TeamForm>;
  onSubmit: (data: TeamForm) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function TeamCreationForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className
}: TeamFormProps) {
  const [formData, setFormData] = useState<TeamForm>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    maxSize: initialData?.maxSize || 12,
    minSkillLevel: initialData?.minSkillLevel || 1,
    maxSkillLevel: initialData?.maxSkillLevel || 10,
    isPublic: initialData?.isPublic ?? true,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
      [type === 'min' ? 'minSkillLevel' : 'maxSkillLevel']: level
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Team name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Team name must be less than 50 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.maxSize < 5) {
      newErrors.maxSize = 'Team must have at least 5 members';
    } else if (formData.maxSize > 20) {
      newErrors.maxSize = 'Team cannot have more than 20 members';
    }

    if (formData.minSkillLevel > formData.maxSkillLevel) {
      newErrors.skillRange = 'Minimum skill level cannot be higher than maximum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit(formData);
  };

  return (
    <motion.div
      className={cn(
        'rounded-xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Create team
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Set up your team profile, size, privacy, and preferred skill level.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left column: branding + basic info */}
          <div className="space-y-5">
            {/* Team Logo Upload */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-slate-200">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Team logo"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <Users className="h-8 w-8" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-400">
                  <Upload className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-200">
                  Team logo
                </p>
                <p className="text-xs text-slate-500">
                  Optional. Square images work best (at least 256×256).
                </p>
              </div>
            </div>

            {/* Team Name */}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-slate-300">
                Team name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className={cn(
                  'block w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
                  errors.name ? 'border-red-500/70' : 'border-slate-700'
                )}
                placeholder="Enter your team name"
                maxLength={50}
              />
              {errors.name && (
                <motion.p
                  className="mt-1 text-xs text-red-400"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.name}
                </motion.p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-1.5 block text-xs font-medium text-slate-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className={cn(
                  'block w-full resize-none rounded-lg border bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
                  errors.description ? 'border-red-500/70' : 'border-slate-700'
                )}
                placeholder="Tell others about your team, playing style, and goals…"
                maxLength={500}
              />
              <div className="mt-1 flex justify-between">
                {errors.description && (
                  <motion.p
                    className="text-xs text-red-400"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.description}
                  </motion.p>
                )}
                <p className="ml-auto text-xs text-slate-500">
                  {formData.description?.length || 0}/500
                </p>
              </div>
            </div>
          </div>

          {/* Right column: settings */}
          <div className="space-y-6">
            {/* Max Team Size */}
            <div>
              <label htmlFor="maxSize" className="mb-1.5 block text-xs font-medium text-slate-300">
                Maximum team size
              </label>
              <select
                id="maxSize"
                name="maxSize"
                value={formData.maxSize}
                onChange={handleInputChange}
                className={cn(
                  'block w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500',
                  errors.maxSize ? 'border-red-500/70' : 'border-slate-700'
                )}
              >
                {Array.from({ length: 16 }, (_, i) => i + 5).map((size) => (
                  <option key={size} value={size}>
                    {size} players
                  </option>
                ))}
              </select>
              {errors.maxSize && (
                <motion.p
                  className="mt-1 text-xs text-red-400"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.maxSize}
                </motion.p>
              )}
            </div>

            {/* Team Privacy */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Team privacy
              </label>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center">
                  <input
                    type="radio"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={() => setFormData((prev) => ({ ...prev, isPublic: true }))}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-xs transition-colors',
                      formData.isPublic
                        ? 'border-primary-500 bg-slate-900'
                        : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                    )}
                  >
                    <Globe className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-100">Public</p>
                      <p className="text-[11px] text-slate-500">Anyone can find and request to join.</p>
                    </div>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center">
                  <input
                    type="radio"
                    name="isPublic"
                    checked={!formData.isPublic}
                    onChange={() => setFormData((prev) => ({ ...prev, isPublic: false }))}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-xs transition-colors',
                      !formData.isPublic
                        ? 'border-primary-500 bg-slate-900'
                        : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                    )}
                  >
                    <Lock className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-100">Private</p>
                      <p className="text-[11px] text-slate-500">Invite-only. Hidden from search.</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Skill Level Range */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-slate-300">
                Skill level requirements
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <InteractiveSkillSelector
                  level={formData.minSkillLevel}
                  onChange={(level) => handleSkillLevelChange('min', level)}
                  label="Minimum level"
                />

                <InteractiveSkillSelector
                  level={formData.maxSkillLevel}
                  onChange={(level) => handleSkillLevelChange('max', level)}
                  label="Maximum level"
                />
              </div>
              {errors.skillRange && (
                <motion.p
                  className="text-xs text-red-400"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.skillRange}
                </motion.p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-2 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:justify-end">
          {onCancel && (
            <GameButton
              type="button"
              variant="secondary"
              size="md"
              onClick={onCancel}
              className="sm:w-auto"
              icon={<X className="w-4 h-4" />}
            >
              Cancel
            </GameButton>
          )}

          <GameButton
            type="submit"
            variant="primary"
            size="md"
            loading={isLoading}
            className="sm:w-auto"
            icon={<Save className="w-4 h-4" />}
          >
            {isLoading ? 'Creating team…' : 'Create Team'}
          </GameButton>
        </div>
      </form>
    </motion.div>
  );
}

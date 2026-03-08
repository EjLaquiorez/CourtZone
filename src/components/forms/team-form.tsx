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
        'bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-8 border border-primary-400/20',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Create Your Team 👥
          </h2>
          <p className="text-primary-200">
            Build your championship squad and dominate the court
          </p>
        </div>

        {/* Team Logo Upload */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 basketball-glow">
              {logoPreview ? (
                <img src={logoPreview} alt="Team logo" className="w-full h-full rounded-full object-cover" />
              ) : (
                <Users className="w-12 h-12 text-white" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors">
              <Upload className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-primary-300">Upload team logo (optional)</p>
        </div>

        {/* Team Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-primary-200 mb-2">
            Team Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            className={cn(
              "block w-full px-4 py-3 border rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "transition-all duration-200",
              errors.name ? "border-red-500/50" : "border-primary-400/30"
            )}
            placeholder="Enter your team name"
            maxLength={50}
          />
          {errors.name && (
            <motion.p
              className="mt-1 text-sm text-red-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.name}
            </motion.p>
          )}
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
            className={cn(
              "block w-full px-4 py-3 border rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "transition-all duration-200 resize-none",
              errors.description ? "border-red-500/50" : "border-primary-400/30"
            )}
            placeholder="Tell others about your team, playing style, and goals..."
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            {errors.description && (
              <motion.p
                className="text-sm text-red-400"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.description}
              </motion.p>
            )}
            <p className="text-xs text-primary-300 ml-auto">
              {formData.description?.length || 0}/500
            </p>
          </div>
        </div>

        {/* Team Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Max Team Size */}
          <div>
            <label htmlFor="maxSize" className="block text-sm font-medium text-primary-200 mb-2">
              Maximum Team Size
            </label>
            <select
              id="maxSize"
              name="maxSize"
              value={formData.maxSize}
              onChange={handleInputChange}
              className={cn(
                "block w-full px-4 py-3 border rounded-lg bg-dark-200/50 text-primary-100",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                "transition-all duration-200",
                errors.maxSize ? "border-red-500/50" : "border-primary-400/30"
              )}
            >
              {Array.from({ length: 16 }, (_, i) => i + 5).map(size => (
                <option key={size} value={size}>{size} players</option>
              ))}
            </select>
            {errors.maxSize && (
              <motion.p
                className="mt-1 text-sm text-red-400"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.maxSize}
              </motion.p>
            )}
          </div>

          {/* Team Privacy */}
          <div>
            <label className="block text-sm font-medium text-primary-200 mb-3">
              Team Privacy
            </label>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                  className="sr-only"
                />
                <div className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-all",
                  formData.isPublic 
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
                  name="isPublic"
                  checked={!formData.isPublic}
                  onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                  className="sr-only"
                />
                <div className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-all",
                  !formData.isPublic 
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

        {/* Skill Level Range */}
        <div className="space-y-4">
          <h3 className="text-lg font-display font-bold text-white">
            Skill Level Requirements
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InteractiveSkillSelector
              level={formData.minSkillLevel}
              onChange={(level) => handleSkillLevelChange('min', level)}
              label="Minimum Skill Level"
            />
            
            <InteractiveSkillSelector
              level={formData.maxSkillLevel}
              onChange={(level) => handleSkillLevelChange('max', level)}
              label="Maximum Skill Level"
            />
          </div>

          {errors.skillRange && (
            <motion.p
              className="text-sm text-red-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.skillRange}
            </motion.p>
          )}
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
            loading={isLoading}
            glow
            className="sm:flex-1"
            icon={<Save className="w-5 h-5" />}
          >
            {isLoading ? 'Creating Team...' : 'Create Team'}
          </GameButton>
        </div>
      </form>
    </motion.div>
  );
}

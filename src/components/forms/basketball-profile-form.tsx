'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Target,
  Trophy,
  Clock,
  Users,
  Star,
  Save,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { GameButton } from '@/components/ui/game-button';
import { cn } from '@/lib/utils';
import { POSITIONS, Position } from '@/types';
import { BasketballProfileFormData, userSchemas } from '@/lib/validation';
import { useToast } from '@/components/ui/toast';
import { validateForm } from '@/lib/validation';

interface BasketballProfileFormProps {
  initialData?: Partial<BasketballProfileFormData>;
  onSubmit: (data: BasketballProfileFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PLAYING_STYLES = [
  { value: 'aggressive', label: 'Aggressive', description: 'Attack the rim, physical play' },
  { value: 'defensive', label: 'Defensive', description: 'Lock down defense, steals' },
  { value: 'playmaker', label: 'Playmaker', description: 'Create plays, assist others' },
  { value: 'shooter', label: 'Shooter', description: 'Perimeter shooting, spacing' },
  { value: 'all-around', label: 'All-Around', description: 'Versatile, adaptable' },
] as const;

const GAME_TYPES = [
  { value: 'pickup', label: 'Pickup Games' },
  { value: 'tournament', label: 'Tournaments' },
  { value: 'scrimmage', label: 'Scrimmages' },
  { value: 'practice', label: 'Practice Sessions' },
] as const;

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
] as const;

const TIME_PREFERENCES = [
  { value: 'morning', label: 'Morning (6AM - 12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
  { value: 'evening', label: 'Evening (6PM - 10PM)' },
  { value: 'night', label: 'Night (10PM - 6AM)' },
] as const;

const COMMON_STRENGTHS = [
  'Three-point shooting', 'Defense', 'Rebounding', 'Ball handling', 'Speed',
  'Court vision', 'Leadership', 'Finishing at rim', 'Free throws', 'Passing'
];

const COMMON_WEAKNESSES = [
  'Three-point shooting', 'Defense', 'Ball handling', 'Conditioning',
  'Free throws', 'Turnovers', 'Rebounding'
];

export function BasketballProfileForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: BasketballProfileFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<BasketballProfileFormData>>({
    username: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    bio: '',
    position: 'PG',
    skillLevel: 5,
    yearsOfExperience: 0,
    height: undefined,
    weight: undefined,
    playingStyle: undefined,
    strengths: [],
    weaknesses: [],
    preferredGameTypes: [],
    availability: [],
    preferredTimes: [],
    phone: '',
    city: '',
    maxDistance: 10,
    socialMedia: {
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: ''
    },
    ...initialData
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const steps = [
    { title: 'Personal Info', icon: <User className="w-5 h-5" /> },
    { title: 'Basketball Details', icon: <Trophy className="w-5 h-5" /> },
    { title: 'Playing Style', icon: <Target className="w-5 h-5" /> },
    { title: 'Preferences', icon: <Clock className="w-5 h-5" /> },
    { title: 'Contact & Location', icon: <MapPin className="w-5 h-5" /> }
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const toggleArrayValue = (field: string, value: string) => {
    const currentArray = formData[field as keyof typeof formData] as string[] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFormData(field, newArray);
  };

  const validateCurrentStep = (): boolean => {
    const stepFields: Record<number, string[]> = {
      0: ['username', 'firstName', 'lastName', 'dateOfBirth'],
      1: ['position', 'skillLevel', 'yearsOfExperience'],
      2: [], // Optional fields
      3: [], // Optional fields
      4: ['city', 'maxDistance']
    };

    const fieldsToValidate = stepFields[currentStep] || [];
    const stepData: any = {};

    fieldsToValidate.forEach(field => {
      stepData[field] = formData[field as keyof typeof formData];
    });

    // Only validate if there are required fields for this step
    if (fieldsToValidate.length === 0) return true;

    try {
      // Create a partial schema for step validation
      const stepSchema = userSchemas.basketballProfile.pick(
        Object.fromEntries(fieldsToValidate.map(field => [field, true])) as any
      );
      stepSchema.parse(stepData);
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate entire form
    const result = validateForm(userSchemas.basketballProfile, formData);

    if (!result.success && result.errors) {
      setErrors(result.errors);
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      await onSubmit(formData as BasketballProfileFormData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all",
                index === currentStep
                  ? "bg-primary-500/20 text-primary-300"
                  : index < currentStep
                  ? "bg-court-500/20 text-court-300"
                  : "bg-dark-300/50 text-primary-400"
              )}
            >
              {step.icon}
              <span className="font-medium text-sm">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-dark-300/50 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-primary-500 to-court-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Form Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20 mb-6"
      >
        {/* Step 0: Personal Information */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-white mb-4">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => updateFormData('username', e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 bg-dark-200/50 border rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500",
                    errors.username ? 'border-red-500' : 'border-primary-400/30'
                  )}
                  placeholder="Enter your username"
                />
                {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 bg-dark-200/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500",
                    errors.dateOfBirth ? 'border-red-500' : 'border-primary-400/30'
                  )}
                />
                {errors.dateOfBirth && <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 bg-dark-200/50 border rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500",
                    errors.firstName ? 'border-red-500' : 'border-primary-400/30'
                  )}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 bg-dark-200/50 border rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500",
                    errors.lastName ? 'border-red-500' : 'border-primary-400/30'
                  )}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => updateFormData('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Tell us about yourself and your basketball journey..."
                maxLength={500}
              />
              <p className="text-xs text-primary-400 mt-1">
                {(formData.bio || '').length}/500 characters
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Basketball Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-white mb-4">Basketball Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-3">
                  Position *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(POSITIONS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateFormData('position', key as Position)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        formData.position === key
                          ? "bg-primary-500/20 border-primary-500 text-primary-300"
                          : "bg-dark-200/50 border-primary-400/30 text-primary-200 hover:border-primary-400/50"
                      )}
                    >
                      <div className="font-medium">{key}</div>
                      <div className="text-sm opacity-75">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Skill Level * (1-10)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.skillLevel}
                      onChange={(e) => updateFormData('skillLevel', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-dark-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-primary-300 font-bold text-lg w-8 text-center">
                      {formData.skillLevel}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-primary-400 mt-1">
                    <span>Beginner</span>
                    <span>Expert</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.yearsOfExperience}
                    onChange={(e) => updateFormData('yearsOfExperience', parseInt(e.target.value) || 0)}
                    className={cn(
                      "w-full px-4 py-3 bg-dark-200/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500",
                      errors.yearsOfExperience ? 'border-red-500' : 'border-primary-400/30'
                    )}
                    placeholder="0"
                  />
                  {errors.yearsOfExperience && <p className="text-red-400 text-sm mt-1">{errors.yearsOfExperience}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-200 mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      min="120"
                      max="250"
                      value={formData.height || ''}
                      onChange={(e) => updateFormData('height', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="180"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-200 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="200"
                      value={formData.weight || ''}
                      onChange={(e) => updateFormData('weight', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="75"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Playing Style */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-white mb-4">Playing Style</h3>

            <div>
              <label className="block text-sm font-medium text-primary-200 mb-3">
                Preferred Playing Style
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PLAYING_STYLES.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => updateFormData('playingStyle', style.value)}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all",
                      formData.playingStyle === style.value
                        ? "bg-primary-500/20 border-primary-500 text-primary-300"
                        : "bg-dark-200/50 border-primary-400/30 text-primary-200 hover:border-primary-400/50"
                    )}
                  >
                    <div className="font-medium">{style.label}</div>
                    <div className="text-sm opacity-75">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-3">
                  Strengths (Select up to 5)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {COMMON_STRENGTHS.map((strength) => (
                    <button
                      key={strength}
                      type="button"
                      onClick={() => toggleArrayValue('strengths', strength)}
                      disabled={(formData.strengths?.length || 0) >= 5 && !formData.strengths?.includes(strength)}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        formData.strengths?.includes(strength)
                          ? "bg-court-500/20 border-court-500 text-court-300"
                          : "bg-dark-200/50 border-primary-400/30 text-primary-200 hover:border-primary-400/50",
                        (formData.strengths?.length || 0) >= 5 && !formData.strengths?.includes(strength) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {strength}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-primary-400 mt-2">
                  {formData.strengths?.length || 0}/5 selected
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-3">
                  Areas to Improve (Select up to 3)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {COMMON_WEAKNESSES.map((weakness) => (
                    <button
                      key={weakness}
                      type="button"
                      onClick={() => toggleArrayValue('weaknesses', weakness)}
                      disabled={(formData.weaknesses?.length || 0) >= 3 && !formData.weaknesses?.includes(weakness)}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        formData.weaknesses?.includes(weakness)
                          ? "bg-warning-500/20 border-warning-500 text-warning-300"
                          : "bg-dark-200/50 border-primary-400/30 text-primary-200 hover:border-primary-400/50",
                        (formData.weaknesses?.length || 0) >= 3 && !formData.weaknesses?.includes(weakness) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {weakness}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-primary-400 mt-2">
                  {formData.weaknesses?.length || 0}/3 selected
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-white mb-4">Game Preferences</h3>

            <div>
              <label className="block text-sm font-medium text-primary-200 mb-3">
                Preferred Game Types
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {GAME_TYPES.map((gameType) => (
                  <button
                    key={gameType.value}
                    type="button"
                    onClick={() => toggleArrayValue('preferredGameTypes', gameType.value)}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-all",
                      formData.preferredGameTypes?.includes(gameType.value)
                        ? "bg-primary-500/20 border-primary-500 text-primary-300"
                        : "bg-dark-200/50 border-primary-400/30 text-primary-200 hover:border-primary-400/50"
                    )}
                  >
                    <div className="font-medium text-sm">{gameType.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-200 mb-3">
                Available Days
              </label>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleArrayValue('availability', day.value)}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-all",
                      formData.availability?.includes(day.value)
                        ? "bg-court-500/20 border-court-500 text-court-300"
                        : "bg-dark-200/50 border-primary-400/30 text-primary-200 hover:border-primary-400/50"
                    )}
                  >
                    <div className="font-medium text-sm">{day.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-200 mb-3">
                Preferred Times
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TIME_PREFERENCES.map((time) => (
                  <button
                    key={time.value}
                    type="button"
                    onClick={() => toggleArrayValue('preferredTimes', time.value)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      formData.preferredTimes?.includes(time.value)
                        ? "bg-info-500/20 border-info-500 text-info-300"
                        : "bg-dark-200/50 border-primary-400/30 text-primary-200 hover:border-primary-400/50"
                    )}
                  >
                    <div className="font-medium">{time.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Contact & Location */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-white mb-4">Contact & Location</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 bg-dark-200/50 border rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500",
                    errors.city ? 'border-red-500' : 'border-primary-400/30'
                  )}
                  placeholder="Enter your city"
                />
                {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Max Travel Distance * ({formData.maxDistance} km)
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={formData.maxDistance}
                onChange={(e) => updateFormData('maxDistance', parseInt(e.target.value))}
                className="w-full h-2 bg-dark-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-primary-400 mt-1">
                <span>1 km</span>
                <span>100 km</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-200 mb-3">
                Social Media (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-primary-300 mb-1">Instagram</label>
                  <input
                    type="text"
                    value={formData.socialMedia?.instagram || ''}
                    onChange={(e) => updateNestedFormData('socialMedia', 'instagram', e.target.value)}
                    className="w-full px-4 py-2 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-xs text-primary-300 mb-1">Twitter</label>
                  <input
                    type="text"
                    value={formData.socialMedia?.twitter || ''}
                    onChange={(e) => updateNestedFormData('socialMedia', 'twitter', e.target.value)}
                    className="w-full px-4 py-2 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-xs text-primary-300 mb-1">YouTube</label>
                  <input
                    type="text"
                    value={formData.socialMedia?.youtube || ''}
                    onChange={(e) => updateNestedFormData('socialMedia', 'youtube', e.target.value)}
                    className="w-full px-4 py-2 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Channel name"
                  />
                </div>

                <div>
                  <label className="block text-xs text-primary-300 mb-1">TikTok</label>
                  <input
                    type="text"
                    value={formData.socialMedia?.tiktok || ''}
                    onChange={(e) => updateNestedFormData('socialMedia', 'tiktok', e.target.value)}
                    className="w-full px-4 py-2 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {currentStep > 0 && (
            <GameButton
              variant="secondary"
              onClick={prevStep}
              icon={<ChevronLeft className="w-5 h-5" />}
              disabled={isLoading}
            >
              Previous
            </GameButton>
          )}
        </div>

        <div className="flex space-x-3">
          <GameButton
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            icon={<X className="w-5 h-5" />}
          >
            Cancel
          </GameButton>

          {currentStep < steps.length - 1 ? (
            <GameButton
              variant="primary"
              onClick={nextStep}
              icon={<ChevronRight className="w-5 h-5" />}
              iconPosition="right"
              disabled={isLoading}
            >
              Next
            </GameButton>
          ) : (
            <GameButton
              variant="success"
              onClick={handleSubmit}
              loading={isLoading}
              icon={<Save className="w-5 h-5" />}
            >
              Save Profile
            </GameButton>
          )}
        </div>
      </div>
    </div>
  );
}

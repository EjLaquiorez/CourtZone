'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Trophy,
  Target,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { GameButton } from '@/components/ui/game-button';
import { useToastHelpers } from '@/components/ui/toast';

const positions = [
  { value: 'PG', label: 'Point Guard', description: 'Floor general, playmaker' },
  { value: 'SG', label: 'Shooting Guard', description: 'Scorer, perimeter shooter' },
  { value: 'SF', label: 'Small Forward', description: 'Versatile wing player' },
  { value: 'PF', label: 'Power Forward', description: 'Strong inside presence' },
  { value: 'C', label: 'Center', description: 'Rim protector, rebounder' },
];

const skillLevels = [
  { value: 1, label: 'Beginner', description: 'Just starting out' },
  { value: 2, label: 'Recreational', description: 'Play for fun occasionally' },
  { value: 3, label: 'Intermediate', description: 'Regular player with solid skills' },
  { value: 4, label: 'Advanced', description: 'Competitive player' },
  { value: 5, label: 'Elite', description: 'High-level competitive player' },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const toast = useToastHelpers();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    position: '',
    skillLevel: 0,
    location: '',
    bio: '',
    preferredPlayStyle: '',
    availability: [] as string[],
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.position || !formData.skillLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Transform form data to match API expectations
      const profileData = {
        username: formData.username,
        position: formData.position,
        skillLevel: formData.skillLevel,
        city: formData.location, // Map location to city
        // Note: bio is not supported by the current API, but we can add it later
      };

      await updateProfile(profileData);
      toast.success('Profile setup complete! Welcome to LARO!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.username.length >= 3;
      case 2:
        return formData.position !== '';
      case 3:
        return formData.skillLevel > 0;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      {/* Basketball court background */}
      <div className="absolute inset-0 opacity-5">
        <div className="court-lines w-full h-full" />
      </div>

      <motion.div
        className="relative w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center basketball-glow mx-auto mb-4"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-white text-2xl">🏀</span>
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-primary-200">
            Let's set up your basketball profile to find the perfect matches
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-primary-300">Step {step} of {totalSteps}</span>
            <span className="text-sm text-primary-300">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-dark-400 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-8 border border-primary-400/20">
          {/* Step 1: Username */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-primary-400 mr-3" />
                <h2 className="text-xl font-display font-bold text-white">Choose Your Username</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your username"
                    minLength={3}
                    maxLength={20}
                  />
                  <p className="text-xs text-primary-300 mt-1">
                    This is how other players will see you (3-20 characters)
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Position */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center mb-6">
                <Target className="w-6 h-6 text-primary-400 mr-3" />
                <h2 className="text-xl font-display font-bold text-white">Your Position</h2>
              </div>

              <div className="grid gap-3">
                {positions.map((position) => (
                  <motion.button
                    key={position.value}
                    onClick={() => setFormData({ ...formData, position: position.value })}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.position === position.value
                        ? 'border-primary-500 bg-primary-500/20'
                        : 'border-primary-400/30 bg-dark-200/30 hover:border-primary-400/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{position.label}</h3>
                        <p className="text-sm text-primary-300">{position.description}</p>
                      </div>
                      {formData.position === position.value && (
                        <Check className="w-5 h-5 text-primary-400" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Skill Level */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center mb-6">
                <Trophy className="w-6 h-6 text-primary-400 mr-3" />
                <h2 className="text-xl font-display font-bold text-white">Skill Level</h2>
              </div>

              <div className="grid gap-3">
                {skillLevels.map((level) => (
                  <motion.button
                    key={level.value}
                    onClick={() => setFormData({ ...formData, skillLevel: level.value })}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.skillLevel === level.value
                        ? 'border-primary-500 bg-primary-500/20'
                        : 'border-primary-400/30 bg-dark-200/30 hover:border-primary-400/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{level.label}</h3>
                        <p className="text-sm text-primary-300">{level.description}</p>
                      </div>
                      {formData.skillLevel === level.value && (
                        <Check className="w-5 h-5 text-primary-400" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Additional Info */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center mb-6">
                <MapPin className="w-6 h-6 text-primary-400 mr-3" />
                <h2 className="text-xl font-display font-bold text-white">Additional Info</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell other players about yourself..."
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-primary-300 mt-1">
                    {formData.bio.length}/200 characters
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <GameButton
              variant="secondary"
              onClick={handlePrevious}
              disabled={step === 1}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </GameButton>

            {step < totalSteps ? (
              <GameButton
                variant="primary"
                onClick={handleNext}
                disabled={!isStepValid(step)}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Next
              </GameButton>
            ) : (
              <GameButton
                variant="primary"
                onClick={handleSubmit}
                disabled={!isStepValid(step) || isLoading}
                loading={isLoading}
                icon={<Check className="w-4 h-4" />}
                iconPosition="right"
              >
                Complete Setup
              </GameButton>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

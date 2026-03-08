'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, MapPin, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GameButton } from '@/components/ui/game-button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/components/ui/toast';
import { POSITIONS, SKILL_LEVELS, Position } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, register } = useAuthStore();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    agreeToTerms: false,
    position: '',
    skillLevel: 5,
    city: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillLevelChange = (level: number) => {
    setFormData(prev => ({ ...prev, skillLevel: level }));
    if (errors.skillLevel) {
      setErrors(prev => ({ ...prev, skillLevel: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old';
      }
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.position) {
      newErrors.position = 'Please select your position';
    }

    if (!formData.skillLevel) {
      newErrors.skillLevel = 'Please select your skill level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setErrors({});

    // Prepare data for API
    const registrationData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      agreeToTerms: formData.agreeToTerms,
      position: formData.position as Position | undefined,
      skillLevel: formData.skillLevel,
      city: formData.city || undefined
    };

    // Call the registration API directly
    setIsSubmitting(true);
    try {
      await register(registrationData);
      toast({ title: 'Account created successfully! Please complete your profile.' });
      // Redirect to profile setup
      router.push('/profile/setup');
    } catch (error: any) {
      console.error('Registration failed:', error);
      setErrors({
        general: error.message || 'Registration failed. Please try again.'
      });
      toast({ title: error.message || 'Registration failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      {/* Basketball court background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="court-lines w-full h-full" />
      </div>

      {/* Animated basketball */}
      <motion.div
        className="absolute top-10 left-10 text-4xl"
        animate={{
          y: [0, -15, 0],
          rotate: [0, -180, -360]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        🏀
      </motion.div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <motion.div
            className="flex items-center justify-center space-x-2 mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center basketball-glow">
              <span className="text-white font-bold text-xl">🏀</span>
            </div>
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              LARO
            </h1>
          </motion.div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Join the Game
          </h2>
          <p className="text-primary-200">
            Create your account and start your basketball journey
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
              step >= 1 ? "bg-primary-500 text-white" : "bg-dark-300 text-primary-400"
            )}>
              1
            </div>
            <div className={cn(
              "w-16 h-1 transition-all",
              step >= 2 ? "bg-primary-500" : "bg-dark-300"
            )} />
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
              step >= 2 ? "bg-primary-500 text-white" : "bg-dark-300 text-primary-400"
            )}>
              2
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <motion.div
          className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-8 border border-primary-400/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <motion.div
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {errors.general}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* First Name Field */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-primary-200 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={cn(
                      "block w-full py-3 px-3 border rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                      "transition-all duration-200",
                      errors.firstName ? "border-red-500/50" : "border-primary-400/30"
                    )}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <motion.p
                      className="mt-1 text-sm text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.firstName}
                    </motion.p>
                  )}
                </div>
                {/* Last Name Field */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-primary-200 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={cn(
                      "block w-full py-3 px-3 border rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                      "transition-all duration-200",
                      errors.lastName ? "border-red-500/50" : "border-primary-400/30"
                    )}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <motion.p
                      className="mt-1 text-sm text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.lastName}
                    </motion.p>
                  )}
                </div>
                {/* Date of Birth Field */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-primary-200 mb-2">
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={cn(
                      "block w-full py-3 px-3 border rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                      "transition-all duration-200",
                      errors.dateOfBirth ? "border-red-500/50" : "border-primary-400/30"
                    )}
                  />
                  {errors.dateOfBirth && (
                    <motion.p
                      className="mt-1 text-sm text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.dateOfBirth}
                    </motion.p>
                  )}
                </div>
                {/* Agree to Terms Checkbox */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={e => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                      className="rounded border-primary-400/30 bg-dark-200/50 text-primary-500 focus:ring-primary-500 focus:ring-offset-0 mr-2"
                    />
                    <span className="text-sm text-primary-200">I agree to the <a href="/terms" className="underline text-primary-400" target="_blank" rel="noopener noreferrer">terms and conditions</a></span>
                  </label>
                  {errors.agreeToTerms && (
                    <motion.p
                      className="mt-1 text-sm text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.agreeToTerms}
                    </motion.p>
                  )}
                </div>

                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-primary-200 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-primary-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={cn(
                        "block w-full pl-10 pr-3 py-3 border rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                        "transition-all duration-200",
                        errors.username ? "border-red-500/50" : "border-primary-400/30"
                      )}
                      placeholder="Choose a username"
                    />
                  </div>
                  {errors.username && (
                    <motion.p
                      className="mt-1 text-sm text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.username}
                    </motion.p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-primary-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={cn(
                        "block w-full pl-10 pr-3 py-3 border rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                        "transition-all duration-200",
                        errors.email ? "border-red-500/50" : "border-primary-400/30"
                      )}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      className="mt-1 text-sm text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-primary-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-primary-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={cn(
                        "block w-full pl-10 pr-10 py-3 border rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                        "transition-all duration-200",
                        errors.password ? "border-red-500/50" : "border-primary-400/30"
                      )}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-primary-400 hover:text-primary-300" />
                      ) : (
                        <Eye className="h-5 w-5 text-primary-400 hover:text-primary-300" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      className="mt-1 text-sm text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-200 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-primary-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={cn(
                        "block w-full pl-10 pr-10 py-3 border rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                        "transition-all duration-200",
                        errors.confirmPassword ? "border-red-500/50" : "border-primary-400/30"
                      )}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-primary-400 hover:text-primary-300" />
                      ) : (
                        <Eye className="h-5 w-5 text-primary-400 hover:text-primary-300" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      className="mt-1 text-sm text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                {/* Next Button */}
                <GameButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  glow
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Continue
                </GameButton>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-display font-bold text-white mb-2">
                    Basketball Profile
                  </h3>
                  <p className="text-sm text-primary-200">
                    Help us match you with the right players and teams
                  </p>
                </div>

                {/* Position Selection */}
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-3">
                    Preferred Position
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(POSITIONS).map(([key, value]) => (
                      <motion.button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, position: key }))}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all duration-200",
                          formData.position === key
                            ? "border-primary-500 bg-primary-500/10 text-primary-100"
                            : "border-primary-400/30 bg-dark-200/50 text-primary-200 hover:border-primary-400/50"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-bold text-sm">{key}</div>
                        <div className="text-xs opacity-80">{value}</div>
                      </motion.button>
                    ))}
                  </div>
                  {errors.position && (
                    <motion.p
                      className="mt-1 text-sm text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.position}
                    </motion.p>
                  )}
                </div>

                {/* Skill Level */}
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-3">
                    Skill Level: {SKILL_LEVELS.find(s => s.value === formData.skillLevel)?.label}
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                      <motion.button
                        key={level}
                        type="button"
                        onClick={() => handleSkillLevelChange(level)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                          level <= formData.skillLevel
                            ? "bg-primary-500 text-white"
                            : "bg-dark-200 text-primary-400 hover:bg-dark-100"
                        )}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Star className="w-4 h-4" fill={level <= formData.skillLevel ? "currentColor" : "none"} />
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-xs text-primary-300 mt-2">
                    {SKILL_LEVELS.find(s => s.value === formData.skillLevel)?.label} - Rate your basketball skills honestly
                  </p>
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-primary-200 mb-2">
                    City (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-primary-400" />
                    </div>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-primary-400/30 rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your city"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <GameButton
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </GameButton>
                  <GameButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    glow
                    loading={isSubmitting}
                    icon={<ArrowRight className="w-5 h-5" />}
                    iconPosition="right"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </GameButton>
                </div>
              </motion.div>
            )}
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-primary-200">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

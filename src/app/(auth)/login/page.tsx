'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GameButton } from '@/components/ui/game-button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/components/ui/toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, login } = useAuthStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: formData.email, password: formData.password });
      toast({ title: 'Login successful!' });
      // Redirect to return URL or dashboard
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    } catch (error: any) {
      console.error('Login failed:', error);
      setErrors({
        general: error.message || 'Login failed. Please try again.'
      });
      toast({ title: error.message || 'Login failed', variant: 'destructive' });
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
        className="absolute top-10 right-10 text-4xl"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 180, 360]
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
            Welcome Back
          </h2>
          <p className="text-primary-200">
            Sign in to continue your basketball journey
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-8 border border-primary-400/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-primary-400/30 bg-dark-200/50 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-primary-200">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <GameButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              glow
              loading={isSubmitting}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </GameButton>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-400/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-300 text-primary-300">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <GameButton
              variant="secondary"
              size="lg"
              fullWidth
              className="border-primary-400/30"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </GameButton>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-primary-200">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

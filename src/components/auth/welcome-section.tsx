'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Users, Shield, Zap } from 'lucide-react';
import { GameButton } from '@/components/ui/game-button';

export function WelcomeSection() {
  return (
    <section className="py-20 relative" aria-label="Welcome section">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome message */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Join the Basketball Community
            </h2>
            <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
              Create your account to connect with players, find games, and build your basketball legacy. 
              It only takes a minute to get started.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              className="bg-gradient-to-br from-dark-300/60 to-dark-400/60 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Users className="w-8 h-8 text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Find Players</h3>
              <p className="text-primary-300 text-sm">
                Connect with basketball players in your area and skill level
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-dark-300/60 to-dark-400/60 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Zap className="w-8 h-8 text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Quick Matches</h3>
              <p className="text-primary-300 text-sm">
                Get matched instantly with players and games near you
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-dark-300/60 to-dark-400/60 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Shield className="w-8 h-8 text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Safe & Secure</h3>
              <p className="text-primary-300 text-sm">
                Verified players and secure platform for peace of mind
              </p>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GameButton
              variant="primary"
              size="lg"
              glow
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
              onClick={() => window.location.href = '/register'}
            >
              Get Started Free
            </GameButton>
            <GameButton
              variant="secondary"
              size="lg"
              onClick={() => window.location.href = '/login'}
            >
              Sign In
            </GameButton>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-12 pt-8 border-t border-primary-400/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-primary-300 mb-4">
              Trusted by basketball players worldwide
            </p>
            <div className="flex items-center justify-center space-x-8 text-primary-400">
              <div className="text-center">
                <div className="text-2xl font-bold">2,847</div>
                <div className="text-xs">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">12,493</div>
                <div className="text-xs">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">892</div>
                <div className="text-xs">Teams Formed</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

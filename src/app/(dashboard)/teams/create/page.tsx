'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav, MobileQuickAction } from '@/components/layout/mobile-nav';
import { GameButton } from '@/components/ui/game-button';
import { TeamCreationForm } from '@/components/forms/team-form';
import { TeamForm } from '@/types';

const mockUser = {
  username: 'CourtKing23',
  avatar: '',
  rating: 1847
};

export default function CreateTeamPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (formData: TeamForm) => {
    setIsLoading(true);

    try {
      // Call real API to create team
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create team');
      }

      console.log('Team created successfully:', result.data);

      // Show success state
      setIsSuccess(true);

      // Redirect to team page after success
      setTimeout(() => {
        router.push(`/teams/${result.data.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error creating team:', error);
      // You could add a toast notification here
      alert(error instanceof Error ? error.message : 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-24 h-24 bg-court-500 rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 0 20px rgba(34, 139, 34, 0.5)',
                '0 0 40px rgba(34, 139, 34, 0.8)',
                '0 0 20px rgba(34, 139, 34, 0.5)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="text-3xl font-display font-bold text-white mb-4">
            Team Created Successfully! 🏀
          </h1>

          <p className="text-primary-200 text-lg mb-6">
            Your team is ready to dominate the court. Redirecting to your team page...
          </p>

          <div className="flex items-center justify-center space-x-2 text-primary-300">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <AuthenticatedHeader
            user={mockUser}
            onMenuToggle={() => setMobileSidebarOpen(true)}
          />

          {/* Page Content */}
          <main className="p-4 lg:p-8">
            {/* Back Button */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GameButton
                variant="ghost"
                size="md"
                onClick={handleCancel}
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Back to Teams
              </GameButton>
            </motion.div>

            {/* Page Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
                Create Your <span className="text-primary-500">Dream Team</span> 🏀
              </h1>
              <p className="text-xl text-primary-200 max-w-2xl mx-auto">
                Build a championship squad and lead them to victory on the basketball court
              </p>
            </motion.div>

            {/* Basketball Court Background */}
            <div className="relative">
              {/* Animated basketballs */}
              <motion.div
                className="absolute top-10 left-10 text-4xl opacity-20"
                animate={{
                  y: [0, -20, 0],
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
                className="absolute top-20 right-20 text-3xl opacity-20"
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, -180, -360]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                🏀
              </motion.div>

              {/* Team Creation Form */}
              <motion.div
                className="max-w-2xl mx-auto relative z-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <TeamCreationForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isLoading={isLoading}
                />
              </motion.div>
            </div>

            {/* Tips Section */}
            <motion.div
              className="max-w-4xl mx-auto mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="bg-gradient-to-r from-primary-500/10 to-court-500/10 rounded-xl p-6 border border-primary-400/20">
                <h3 className="text-lg font-display font-bold text-white mb-4 text-center">
                  💡 Tips for Building a Great Team
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h4 className="font-bold text-primary-100 mb-2">Clear Goals</h4>
                    <p className="text-sm text-primary-300">
                      Define your team's objectives - casual fun, competitive play, or tournament participation.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-court-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">⚖️</span>
                    </div>
                    <h4 className="font-bold text-primary-100 mb-2">Balanced Roster</h4>
                    <p className="text-sm text-primary-300">
                      Mix different skill levels and positions to create a well-rounded team chemistry.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🤝</span>
                    </div>
                    <h4 className="font-bold text-primary-100 mb-2">Team Culture</h4>
                    <p className="text-sm text-primary-300">
                      Foster a positive environment where players support each other and grow together.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav
        notifications={{
          teams: 1
        }}
      />

      {/* Mobile Quick Action Button */}
      <MobileQuickAction />
    </div>
  );
}

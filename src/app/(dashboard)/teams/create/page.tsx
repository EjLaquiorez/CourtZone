'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav } from '@/components/layout/mobile-nav';
import { GameButton } from '@/components/ui/game-button';
import { TeamCreationForm } from '@/components/forms/team-form';
import { TeamForm } from '@/types';
import { useCreateTeam, useCurrentUser } from '@/lib/hooks/use-api';
import { trackEvent } from '@/lib/analytics';

export default function CreateTeamPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { data: currentUserResponse } = useCurrentUser();
  const createTeamMutation = useCreateTeam();
  const user = currentUserResponse?.data || { username: 'Loading...', avatar: '', rating: 0 };

  const handleSubmit = async (formData: TeamForm) => {
    try {
      const result = await createTeamMutation.mutateAsync(formData);
      await trackEvent({
        name: 'team_created',
        properties: {
          teamId: result.data.id,
          teamName: formData.name,
          isPublic: formData.isPublic,
        },
      });

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
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <motion.div
          className="rounded-xl border border-slate-800 bg-slate-900 px-8 py-10 text-center shadow-card-soft"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/10 text-primary-400">
            <CheckCircle className="h-7 w-7" />
          </div>
          <h1 className="mb-2 text-lg font-semibold text-slate-100">
            Team created
          </h1>
          <p className="mb-4 text-sm text-slate-400">
            Your new team is ready. We&apos;ll take you to the team page in a moment.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 lg:h-screen lg:overflow-hidden">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex lg:h-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:flex lg:h-full lg:flex-col lg:overflow-hidden">
          {/* Header */}
          <AuthenticatedHeader
            user={user}
            onMenuToggle={() => setMobileSidebarOpen(true)}
          />

          {/* Page Content */}
          <main className="p-4 lg:flex-1 lg:overflow-y-auto lg:p-8">
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
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="mb-2 text-2xl lg:text-3xl font-semibold text-slate-100">
                Create your team
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-slate-400">
                Build a championship squad and lead them to victory on the basketball court
              </p>
            </motion.div>

            {/* Team Creation Form */}
            <div className="relative">
              <motion.div
                className="relative z-10 mx-auto w-full max-w-[860px]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <TeamCreationForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isLoading={createTeamMutation.isPending}
                />
              </motion.div>
            </div>

            {/* Tips Section */}
            <motion.div
              className="mx-auto mt-10 max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
                <h3 className="mb-4 text-center text-sm font-semibold text-slate-100">
                  Tips for building a great team
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="mb-1 text-xs font-medium text-slate-200">Clear goals</h4>
                      <p className="text-xs text-slate-500">
                      Define your team's objectives - casual fun, competitive play, or tournament participation.
                    </p>
                  </div>

                    <div>
                      <h4 className="mb-1 text-xs font-medium text-slate-200">Balanced roster</h4>
                      <p className="text-xs text-slate-500">
                      Mix different skill levels and positions to create a well-rounded team chemistry.
                    </p>
                  </div>

                    <div>
                      <h4 className="mb-1 text-xs font-medium text-slate-200">Team culture</h4>
                      <p className="text-xs text-slate-500">
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
    </div>
  );
}

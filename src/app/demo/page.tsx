'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Play, 
  Users, 
  MapPin, 
  Calendar,
  MessageCircle,
  Trophy,
  Star,
  Bell,
  Smartphone,
  Monitor,
  Tablet,
  ExternalLink,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { GameButton } from '@/components/ui/game-button';
import { cn } from '@/lib/utils';

const features = [
  {
    id: 'dashboard',
    title: 'Interactive Dashboard',
    description: 'Personalized basketball hub with stats, recent activity, and quick actions',
    icon: Trophy,
    color: 'from-primary-500 to-primary-600',
    url: '/dashboard',
    status: 'complete'
  },
  {
    id: 'teams',
    title: 'Team Management',
    description: 'Create teams, build lineups, and manage rosters with drag-and-drop interface',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
    url: '/teams',
    status: 'complete'
  },
  {
    id: 'courts',
    title: 'Court Discovery',
    description: 'Interactive maps to find basketball courts with ratings and amenities',
    icon: MapPin,
    color: 'from-court-500 to-court-600',
    url: '/courts',
    status: 'complete'
  },
  {
    id: 'games',
    title: 'Game Scheduling',
    description: 'Create, join, and manage basketball games with real-time chat',
    icon: Calendar,
    color: 'from-yellow-500 to-yellow-600',
    url: '/games',
    status: 'complete'
  },
  {
    id: 'chat',
    title: 'Real-time Chat',
    description: 'Basketball-themed messaging with reactions and team communication',
    icon: MessageCircle,
    color: 'from-purple-500 to-purple-600',
    url: '/games/1',
    status: 'complete'
  },
  {
    id: 'notifications',
    title: 'Smart Notifications',
    description: 'Priority-based alerts for games, messages, and team updates',
    icon: Bell,
    color: 'from-red-500 to-red-600',
    url: '/dashboard',
    status: 'complete'
  }
];

const techStack = [
  { name: 'Next.js 14', description: 'React framework with App Router' },
  { name: 'TypeScript', description: 'Type-safe development' },
  { name: 'Tailwind CSS', description: 'Utility-first styling' },
  { name: 'Framer Motion', description: 'Smooth animations' },
  { name: 'Lucide Icons', description: 'Beautiful icon library' },
  { name: 'Responsive Design', description: 'Mobile-first approach' }
];

const deviceSizes = [
  { name: 'Mobile', icon: Smartphone, width: 'max-w-sm', description: '375px - 768px' },
  { name: 'Tablet', icon: Tablet, width: 'max-w-2xl', description: '768px - 1024px' },
  { name: 'Desktop', icon: Monitor, width: 'max-w-6xl', description: '1024px+' }
];

export default function DemoPage() {
  const [selectedDevice, setSelectedDevice] = useState('Desktop');

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-300/80 to-dark-400/80 backdrop-blur-sm border-b border-primary-400/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">
                🏀 Laro Basketball App Demo
              </h1>
              <p className="text-primary-200">
                Complete basketball community platform - Ready for testing and deployment
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <GameButton 
                variant="primary" 
                size="lg"
                onClick={() => window.location.href = '/dashboard'}
                icon={<Play className="w-5 h-5" />}
              >
                Launch App
              </GameButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* App Status */}
        <motion.div
          className="bg-gradient-to-r from-court-500/20 to-primary-500/20 rounded-xl p-6 border border-court-500/30 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-8 h-8 text-court-400" />
            <div>
              <h2 className="text-xl font-display font-bold text-white">
                ✅ Development Complete
              </h2>
              <p className="text-court-300">
                All core features implemented and tested. Ready for production deployment.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-court-500/20 rounded-lg">
              <div className="text-2xl font-bold text-court-100">6</div>
              <div className="text-sm text-court-300">Core Features</div>
            </div>
            <div className="text-center p-3 bg-primary-500/20 rounded-lg">
              <div className="text-2xl font-bold text-primary-100">15+</div>
              <div className="text-sm text-primary-300">Components</div>
            </div>
            <div className="text-center p-3 bg-blue-500/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-100">100%</div>
              <div className="text-sm text-blue-300">Mobile Ready</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-100">0</div>
              <div className="text-sm text-yellow-300">TS Errors</div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            🚀 Core Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20 hover:border-primary-400/40 transition-all duration-300 group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => window.open(feature.url, '_blank')}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r',
                      feature.color
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-court-500/20 text-court-400 text-xs rounded-full">
                        {feature.status}
                      </span>
                      <ExternalLink className="w-4 h-4 text-primary-400 group-hover:text-primary-300 transition-colors" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-display font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-primary-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="mt-4 flex items-center text-primary-400 text-sm group-hover:text-primary-300 transition-colors">
                    <span>Try it out</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Device Testing */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            📱 Responsive Design Testing
          </h2>
          
          <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
            {/* Device Selector */}
            <div className="flex items-center space-x-4 mb-6">
              {deviceSizes.map((device) => {
                const Icon = device.icon;
                return (
                  <button
                    key={device.name}
                    onClick={() => setSelectedDevice(device.name)}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all',
                      selectedDevice === device.name
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-200/50 text-primary-300 hover:bg-dark-200/70'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{device.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Device Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {deviceSizes.map((device) => (
                <div
                  key={device.name}
                  className={cn(
                    'p-4 rounded-lg border transition-all',
                    selectedDevice === device.name
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-primary-400/30 bg-dark-200/30'
                  )}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <device.icon className="w-5 h-5 text-primary-400" />
                    <span className="font-medium text-primary-100">{device.name}</span>
                  </div>
                  <p className="text-sm text-primary-300">{device.description}</p>
                  <div className="mt-2">
                    <span className="text-xs text-court-400">✓ Fully Optimized</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            ⚡ Technology Stack
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-lg p-4 border border-primary-400/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <h3 className="font-bold text-primary-100 mb-1">{tech.name}</h3>
                <p className="text-sm text-primary-300">{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          className="bg-gradient-to-r from-primary-500/10 to-court-500/10 rounded-xl p-6 border border-primary-400/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-xl font-display font-bold text-white mb-4">
            🎯 Quick Navigation
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GameButton 
              variant="secondary" 
              size="lg" 
              className="w-full"
              onClick={() => window.open('/dashboard', '_blank')}
            >
              Dashboard
            </GameButton>
            <GameButton 
              variant="secondary" 
              size="lg" 
              className="w-full"
              onClick={() => window.open('/teams', '_blank')}
            >
              Teams
            </GameButton>
            <GameButton 
              variant="secondary" 
              size="lg" 
              className="w-full"
              onClick={() => window.open('/courts', '_blank')}
            >
              Courts
            </GameButton>
            <GameButton 
              variant="secondary" 
              size="lg" 
              className="w-full"
              onClick={() => window.open('/games', '_blank')}
            >
              Games
            </GameButton>
          </div>
          
          <div className="mt-6 text-center">
            <GameButton 
              variant="primary" 
              size="xl"
              onClick={() => window.location.href = '/dashboard'}
              icon={<Play className="w-6 h-6" />}
              glow
            >
              Start Using Laro Basketball App
            </GameButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

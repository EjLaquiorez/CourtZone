'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  CreditCard, 
  Bell, 
  Users, 
  MapPin, 
  Trophy,
  Smartphone,
  Globe,
  Lock,
  CheckCircle,
  Star
} from 'lucide-react';
import { GameButton } from '@/components/ui/game-button';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'implemented' | 'in-progress' | 'planned';
  features: string[];
}

function FeatureCard({ icon, title, description, status, features }: FeatureCardProps) {
  const statusColors = {
    implemented: 'bg-court-500/20 border-court-500/30 text-court-400',
    'in-progress': 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    planned: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  };

  const statusLabels = {
    implemented: 'Implemented',
    'in-progress': 'In Progress',
    planned: 'Planned',
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white">{title}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
              {statusLabels[status]}
            </span>
          </div>
        </div>
        {status === 'implemented' && (
          <CheckCircle className="w-5 h-5 text-court-500" />
        )}
      </div>
      
      <p className="text-primary-200 text-sm mb-4">{description}</p>
      
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2 text-sm text-primary-300">
            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function FeatureShowcase() {
  const features = [
    {
      icon: <Shield className="w-5 h-5 text-primary-400" />,
      title: 'Authentication System',
      description: 'Secure user authentication with JWT tokens and session management',
      status: 'implemented' as const,
      features: [
        'JWT token management',
        'Secure login/logout',
        'Session persistence',
        'Protected routes',
        'User profile management',
      ],
    },
    {
      icon: <Zap className="w-5 h-5 text-primary-400" />,
      title: 'Real-time Features',
      description: 'Live updates and real-time communication using WebSockets',
      status: 'implemented' as const,
      features: [
        'WebSocket connections',
        'Live game score updates',
        'Real-time notifications',
        'Live chat functionality',
        'User presence tracking',
      ],
    },
    {
      icon: <CreditCard className="w-5 h-5 text-primary-400" />,
      title: 'Payment Integration',
      description: 'Secure payment processing for premium features and tournaments',
      status: 'implemented' as const,
      features: [
        'Stripe payment gateway',
        'Subscription management',
        'Tournament entry fees',
        'Billing history',
        'Multiple payment methods',
      ],
    },
    {
      icon: <Bell className="w-5 h-5 text-primary-400" />,
      title: 'Push Notifications',
      description: 'Browser and email notifications for important events',
      status: 'implemented' as const,
      features: [
        'Browser push notifications',
        'Email notifications',
        'Notification preferences',
        'Automated notifications',
        'Service worker integration',
      ],
    },
    {
      icon: <Users className="w-5 h-5 text-primary-400" />,
      title: 'Team Management',
      description: 'Comprehensive team creation and management system',
      status: 'implemented' as const,
      features: [
        'Team creation and editing',
        'Member management',
        'Team invitations',
        'Role-based permissions',
        'Team statistics',
      ],
    },
    {
      icon: <MapPin className="w-5 h-5 text-primary-400" />,
      title: 'Court Discovery',
      description: 'Find and manage basketball courts with real-time availability',
      status: 'implemented' as const,
      features: [
        'Interactive court maps',
        'Court search and filters',
        'Real-time availability',
        'Court reviews and ratings',
        'Reservation system',
      ],
    },
    {
      icon: <Trophy className="w-5 h-5 text-primary-400" />,
      title: 'Game Matching',
      description: 'Smart game matching and tournament organization',
      status: 'implemented' as const,
      features: [
        'Quick match algorithm',
        'Game creation and joining',
        'Skill-based matching',
        'Tournament management',
        'Game history tracking',
      ],
    },
    {
      icon: <Smartphone className="w-5 h-5 text-primary-400" />,
      title: 'Mobile Optimization',
      description: 'Fully responsive design optimized for mobile devices',
      status: 'implemented' as const,
      features: [
        'Responsive design',
        'Mobile-first approach',
        'Touch-friendly interface',
        'Progressive Web App',
        'Offline functionality',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            LaroHub <span className="text-primary-500">Features</span>
          </h1>
          <p className="text-xl text-primary-200 max-w-3xl mx-auto">
            A comprehensive basketball platform with advanced features for players, teams, and communities
          </p>
        </motion.div>

        {/* Implementation Status */}
        <motion.div
          className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-bold text-white">Implementation Status</h2>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">All Core Features Implemented</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-court-500/20 rounded-lg border border-court-500/30">
              <div className="text-2xl font-bold text-court-400 mb-1">8/8</div>
              <div className="text-sm text-court-300">Features Implemented</div>
            </div>
            <div className="text-center p-4 bg-primary-500/20 rounded-lg border border-primary-500/30">
              <div className="text-2xl font-bold text-primary-400 mb-1">100%</div>
              <div className="text-sm text-primary-300">Backend Integration</div>
            </div>
            <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-400 mb-1">Ready</div>
              <div className="text-sm text-blue-300">Production Ready</div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <GameButton
            variant="primary"
            size="lg"
            onClick={() => window.location.href = '/dashboard'}
          >
            Explore the Platform
          </GameButton>
        </motion.div>
      </div>
    </div>
  );
}

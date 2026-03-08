'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, Search, ArrowLeft, Circle } from 'lucide-react';
import { GameButton } from '@/components/ui/game-button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated 404 with Basketball */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        >
          <div className="text-8xl font-display font-bold text-transparent bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text">
            4
            <motion.span
              className="inline-block text-6xl"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🏀
            </motion.span>
            4
          </div>

          {/* Bouncing basketball shadow */}
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-dark-600 rounded-full opacity-30"
            animate={{
              scaleX: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Error Message */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-display font-bold text-white mb-4">
            Game Not Found!
          </h1>
          <p className="text-primary-300 text-lg mb-2">
            Looks like this page took a shot and missed the hoop.
          </p>
          <p className="text-primary-400 text-sm">
            Don't worry, even the best players miss sometimes!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <GameButton
                variant="primary"
                size="lg"
                icon={<Home className="w-5 h-5" />}
                className="w-full"
                glow
              >
                Back to Court
              </GameButton>
            </Link>

            <Link href="/games" className="flex-1">
              <GameButton
                variant="secondary"
                size="lg"
                icon={<Search className="w-5 h-5" />}
                className="w-full"
              >
                Find Games
              </GameButton>
            </Link>
          </div>

          <Link href="/dashboard">
            <GameButton
              variant="outline"
              size="md"
              icon={<ArrowLeft className="w-4 h-4" />}
              className="w-full"
            >
              Go to Dashboard
            </GameButton>
          </Link>
        </motion.div>

        {/* Basketball Court Animation */}
        <motion.div
          className="mt-12 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {/* Court outline */}
          <div className="w-32 h-20 mx-auto border-2 border-court-500/30 rounded-lg relative">
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-court-500/30 rounded-full" />

            {/* Hoops */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-court-500/50 rounded" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-court-500/50 rounded" />
          </div>

          {/* Floating basketballs */}
          <motion.div
            className="absolute top-0 left-0 text-lg"
            animate={{
              x: [0, 100, 0],
              y: [0, -20, 0],
              rotate: [0, 360, 720],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Circle className="w-4 h-4 text-primary-500/30 fill-current" />
          </motion.div>

          <motion.div
            className="absolute top-0 right-0 text-lg"
            animate={{
              x: [0, -100, 0],
              y: [0, -30, 0],
              rotate: [0, -360, -720],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
              delay: 2
            }}
          >
            <Circle className="w-3 h-3 text-primary-600/20 fill-current" />
          </motion.div>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div
          className="mt-8 pt-6 border-t border-primary-400/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm text-primary-400 italic">
            "You miss 100% of the shots you don't take" - Wayne Gretzky
          </p>
          <p className="text-xs text-primary-500 mt-1">
            But you found 100% of this error page! 🏀
          </p>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          className="mt-6 text-xs text-primary-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p>Need help? Check out our:</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="/help" className="hover:text-primary-300 transition-colors">
              Help Center
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-primary-300 transition-colors">
              Contact Support
            </Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-primary-300 transition-colors">
              FAQ
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Star,
  Car,
  Lightbulb,
  Users,
  Clock,
  Camera,
  Navigation,
  Phone,
  Calendar,
  Wifi,
  Shield,
  Heart,
  Share2,
  Flag,
  MessageCircle
} from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav, MobileQuickAction } from '@/components/layout/mobile-nav';
import { GameButton } from '@/components/ui/game-button';
import { StatCard } from '@/components/ui/stat-card';
import { cn } from '@/lib/utils';
import { Court } from '@/types';

const mockUser = {
  username: 'CourtKing23',
  avatar: '',
  rating: 1847
};

// Mock court data - in real app, would fetch based on ID
const mockCourt: Court = {
  id: '1',
  name: 'Venice Beach Basketball Courts',
  address: '1800 Ocean Front Walk, Venice, CA 90291',
  latitude: 33.9850,
  longitude: -118.4695,
  courtType: 'outdoor',
  surfaceType: 'Asphalt',
  hasLighting: true,
  hasParking: true,
  rating: 4.5,
  reviewCount: 127,
  isVerified: true,
  createdAt: new Date('2024-01-15'),
  photos: [
    '/courts/venice-1.jpg',
    '/courts/venice-2.jpg',
    '/courts/venice-3.jpg',
    '/courts/venice-4.jpg',
    '/courts/venice-5.jpg'
  ],
  amenities: ['Restrooms', 'Water Fountain', 'Nearby Food', 'Beach Access', 'Bike Rental', 'Volleyball Courts']
};

const mockReviews = [
  {
    id: '1',
    user: { username: 'BallerMike', avatar: '', rating: 1650 },
    rating: 5,
    comment: 'Amazing courts right on the beach! Great atmosphere and always active games going on.',
    date: new Date('2024-01-20'),
    helpful: 12
  },
  {
    id: '2',
    user: { username: 'CourtQueen', avatar: '', rating: 1820 },
    rating: 4,
    comment: 'Love the location but can get crowded on weekends. Early morning sessions are the best!',
    date: new Date('2024-01-18'),
    helpful: 8
  },
  {
    id: '3',
    user: { username: 'StreetBaller', avatar: '', rating: 1750 },
    rating: 5,
    comment: 'Iconic spot! The sunset games here are legendary. Definitely a must-visit for any basketball player.',
    date: new Date('2024-01-15'),
    helpful: 15
  }
];

export default function CourtDetailPage() {
  const params = useParams();
  const courtId = params.id as string;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'reviews' | 'schedule'>('overview');
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir//${mockCourt.latitude},${mockCourt.longitude}`;
    window.open(url, '_blank');
  };

  const handleBookCourt = () => {
    console.log('Booking court:', courtId);
    // Implement booking logic
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockCourt.name,
        text: `Check out this basketball court: ${mockCourt.name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'w-4 h-4',
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'
        )}
      />
    ));
  };

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
                onClick={() => window.history.back()}
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Back to Courts
              </GameButton>
            </motion.div>

            {/* Court Header */}
            <motion.div
              className="bg-gradient-to-r from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                  {/* Court Type Icon */}
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-court-500 to-court-600 rounded-full flex items-center justify-center court-shadow">
                      <span className="text-3xl">🌳</span>
                    </div>
                    {mockCourt.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Court Info */}
                  <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">{mockCourt.name}</h1>
                    <div className="flex items-center space-x-4 text-primary-300 mb-2">
                      <span className="text-court-400 font-medium">Outdoor Court</span>
                      <span>•</span>
                      <div className="flex items-center">
                        {renderStars(mockCourt.rating)}
                        <span className="ml-2 font-medium">({mockCourt.reviewCount} reviews)</span>
                      </div>
                      {mockCourt.isVerified && (
                        <>
                          <span>•</span>
                          <span className="text-blue-400 flex items-center">
                            <Shield className="w-4 h-4 mr-1" />
                            Verified
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                      <p className="text-primary-200">{mockCourt.address}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <GameButton
                    variant="ghost"
                    size="md"
                    onClick={() => setIsFavorited(!isFavorited)}
                    icon={<Heart className={cn('w-5 h-5', isFavorited && 'fill-current text-red-500')} />}
                  />
                  <GameButton
                    variant="ghost"
                    size="md"
                    onClick={handleShare}
                    icon={<Share2 className="w-5 h-5" />}
                  />
                  <GameButton
                    variant="secondary"
                    size="md"
                    onClick={handleGetDirections}
                    icon={<Navigation className="w-5 h-5" />}
                  >
                    Directions
                  </GameButton>
                  <GameButton
                    variant="primary"
                    size="md"
                    glow
                    onClick={handleBookCourt}
                    icon={<Calendar className="w-5 h-5" />}
                  >
                    Book Court
                  </GameButton>
                </div>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              className="flex space-x-1 bg-dark-300/50 rounded-lg p-1 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {[
                { id: 'overview', label: 'Overview', icon: MapPin },
                { id: 'photos', label: 'Photos', icon: Camera },
                { id: 'reviews', label: 'Reviews', icon: MessageCircle },
                { id: 'schedule', label: 'Schedule', icon: Calendar }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white'
                        : 'text-primary-300 hover:text-primary-100 hover:bg-primary-400/10'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </motion.div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Rating"
                      value={`${mockCourt.rating}/5`}
                      icon={<Star className="w-6 h-6" />}
                      glowColor="warning"
                    />
                    <StatCard
                      title="Reviews"
                      value={mockCourt.reviewCount}
                      icon={<MessageCircle className="w-6 h-6" />}
                      glowColor="info"
                    />
                    <StatCard
                      title="Surface"
                      value={mockCourt.surfaceType || 'Unknown'}
                      icon={<MapPin className="w-6 h-6" />}
                      glowColor="primary"
                    />
                    <StatCard
                      title="Type"
                      value={mockCourt.courtType === 'indoor' ? 'Indoor' : 'Outdoor'}
                      icon={mockCourt.courtType === 'indoor' ? <Shield className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                      glowColor="success"
                    />
                  </div>

                  {/* Amenities */}
                  <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                    <h3 className="text-xl font-display font-bold text-white mb-6">Amenities & Features</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className={cn(
                        'flex items-center space-x-3 p-4 rounded-lg',
                        mockCourt.hasLighting ? 'bg-court-500/20 text-court-400' : 'bg-dark-200/50 text-gray-400'
                      )}>
                        <Lightbulb className="w-6 h-6" />
                        <span className="font-medium">Lighting</span>
                      </div>

                      <div className={cn(
                        'flex items-center space-x-3 p-4 rounded-lg',
                        mockCourt.hasParking ? 'bg-blue-500/20 text-blue-400' : 'bg-dark-200/50 text-gray-400'
                      )}>
                        <Car className="w-6 h-6" />
                        <span className="font-medium">Parking</span>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-lg bg-primary-500/20 text-primary-400">
                        <Users className="w-6 h-6" />
                        <span className="font-medium">Available</span>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-lg bg-yellow-500/20 text-yellow-400">
                        <Clock className="w-6 h-6" />
                        <span className="font-medium">24/7 Access</span>
                      </div>
                    </div>

                    {/* Additional Amenities */}
                    <div>
                      <h4 className="text-lg font-medium text-primary-200 mb-3">Additional Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {mockCourt.amenities?.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-dark-200/50 text-primary-300 text-sm rounded-full border border-primary-400/20"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'photos' && (
                <div className="space-y-6">
                  {/* Main Photo */}
                  <div className="bg-dark-300 rounded-xl overflow-hidden">
                    <div className="aspect-video bg-dark-200 flex items-center justify-center">
                      <Camera className="w-16 h-16 text-primary-400" />
                      <span className="ml-4 text-primary-300">Photo {selectedPhoto + 1} of {mockCourt.photos?.length || 0}</span>
                    </div>
                  </div>

                  {/* Photo Thumbnails */}
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {mockCourt.photos?.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPhoto(index)}
                        className={cn(
                          'aspect-square bg-dark-200 rounded-lg overflow-hidden border-2 transition-all',
                          selectedPhoto === index ? 'border-primary-500' : 'border-transparent hover:border-primary-400/50'
                        )}
                      >
                        <div className="w-full h-full flex items-center justify-center text-primary-400">
                          <Camera className="w-6 h-6" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews Summary */}
                  <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-display font-bold text-white">Reviews</h3>
                      <GameButton variant="primary" size="sm">
                        Write Review
                      </GameButton>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-100 font-accent">{mockCourt.rating}</div>
                        <div className="flex items-center justify-center mb-1">
                          {renderStars(mockCourt.rating)}
                        </div>
                        <div className="text-sm text-primary-300">{mockCourt.reviewCount} reviews</div>
                      </div>

                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map(stars => (
                          <div key={stars} className="flex items-center space-x-2">
                            <span className="text-sm text-primary-300 w-8">{stars}★</span>
                            <div className="flex-1 bg-dark-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${stars === 5 ? 60 : stars === 4 ? 30 : 10}%` }}
                              />
                            </div>
                            <span className="text-sm text-primary-300 w-8">{stars === 5 ? 76 : stars === 4 ? 38 : 13}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                              {review.user.username.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-primary-100">{review.user.username}</p>
                              <div className="flex items-center space-x-2">
                                {renderStars(review.rating)}
                                <span className="text-sm text-primary-300">{review.date.toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-primary-200 mb-3">{review.comment}</p>

                        <div className="flex items-center space-x-4 text-sm text-primary-300">
                          <button className="hover:text-primary-200 transition-colors">
                            👍 Helpful ({review.helpful})
                          </button>
                          <button className="hover:text-primary-200 transition-colors">
                            Reply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    Court Scheduling Coming Soon
                  </h3>
                  <p className="text-primary-300 mb-6">
                    Real-time court availability and booking will be available in the next update.
                  </p>
                  <GameButton variant="primary" size="lg" glow>
                    Get Notified
                  </GameButton>
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav
        notifications={{
          courts: 2
        }}
      />

      {/* Mobile Quick Action Button */}
      <MobileQuickAction />
    </div>
  );
}

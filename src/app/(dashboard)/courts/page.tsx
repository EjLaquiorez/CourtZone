'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  List,
  Map as MapIcon,
  Plus,
  Crosshair
} from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav, MobileQuickAction } from '@/components/layout/mobile-nav';
import { GameButton } from '@/components/ui/game-button';
import { CourtCard } from '@/components/game/court-card';
import { cn } from '@/lib/utils';
import { Court, CourtFilters } from '@/types';
import { calculateDistance } from '@/lib/utils';

// Lazy load heavy components
import {
  LazyCourtMap,
  CourtMapSkeleton,
  LazyWrapper
} from '@/components/lazy';
import { useLazyLoadTracking } from '@/lib/performance/lazy-loading';
import { usePreloadOnHover } from '@/lib/performance/client-lazy-loading';

// Import API hooks
import { useCurrentUser, useCourts } from '@/lib/hooks/use-api';

export default function CourtsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list'); // Start with list view for better performance
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filters, setFilters] = useState<CourtFilters>({
    courtType: undefined,
    hasLighting: undefined,
    hasParking: undefined,
    maxDistance: 25,
    minRating: 0
  });

  // Fetch data using API hooks
  const { data: currentUserResponse, isLoading: userLoading } = useCurrentUser();
  const user = currentUserResponse?.data;

  const { data: courtsResponse, isLoading: courtsLoading } = useCourts(
    filters,
    1,
    50
  );
  const courts = courtsResponse?.data?.data || [];

  // Track lazy loading performance
  useLazyLoadTracking('CourtsPage');

  // Preload map on hover for better UX
  const mapPreload = usePreloadOnHover(
    () => import('@/components/maps/court-map'),
    'CourtMap'
  );

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to LA if location access denied
          setUserLocation({ lat: 34.0522, lng: -118.2437 });
        }
      );
    }
  }, []);

  // Filter courts based on search and filters
  const filteredCourts = courts.filter((court: Court) => {
    // Search filter
    if (searchQuery && !court.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !court.address.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Court type filter
    if (filters.courtType && court.courtType !== filters.courtType) {
      return false;
    }

    // Amenities filters
    if (filters.hasLighting && !court.hasLighting) {
      return false;
    }
    if (filters.hasParking && !court.hasParking) {
      return false;
    }

    // Rating filter
    if (filters.minRating && court.rating < filters.minRating) {
      return false;
    }

    // Distance filter
    if (filters.maxDistance && userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        court.latitude,
        court.longitude
      );
      if (distance > filters.maxDistance) {
        return false;
      }
    }

    return true;
  });

  // Add distance to courts
  const courtsWithDistance = filteredCourts.map(court => ({
    ...court,
    distance: userLocation ? calculateDistance(
      userLocation.lat,
      userLocation.lng,
      court.latitude,
      court.longitude
    ) : undefined
  }));

  const handleCourtSelect = (court: Court) => {
    setSelectedCourt(court);
  };

  const handleGetDirections = (court: Court) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${court.latitude},${court.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleBookCourt = (court: Court) => {
    console.log('Booking court:', court.id);
    // Implement booking logic
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
            user={user || { username: 'Loading...', avatar: '', rating: 0 }}
            onMenuToggle={() => setMobileSidebarOpen(true)}
          />

          {/* Page Content */}
          <main className="p-4 lg:p-8">
            {/* Page Header */}
            <motion.div
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-2">
                  Courts 🗺️
                </h1>
                <p className="text-primary-200 text-lg">
                  Discover basketball courts near you
                </p>
              </div>

              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <GameButton
                  variant="secondary"
                  size="md"
                  icon={<Plus className="w-5 h-5" />}
                >
                  Add Court
                </GameButton>
              </div>
            </motion.div>

            {/* Search and Controls */}
            <motion.div
              className="bg-gradient-to-r from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-primary-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-primary-400/30 rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search courts by name or location..."
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-dark-200/50 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setViewMode('map');
                      setMapLoaded(true);
                    }}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                      viewMode === 'map'
                        ? 'bg-primary-500 text-white'
                        : 'text-primary-300 hover:text-primary-100'
                    )}
                    {...mapPreload}
                  >
                    <MapIcon className="w-4 h-4" />
                    <span>Map</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                      viewMode === 'list'
                        ? 'bg-primary-500 text-white'
                        : 'text-primary-300 hover:text-primary-100'
                    )}
                  >
                    <List className="w-4 h-4" />
                    <span>List</span>
                  </button>
                </div>

                {/* Location Button */}
                <GameButton
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setUserLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                          });
                        }
                      );
                    }
                  }}
                  icon={<Crosshair className="w-5 h-5" />}
                >
                  My Location
                </GameButton>
              </div>
            </motion.div>

            {/* Results Summary */}
            <motion.div
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-primary-300">
                Found {filteredCourts.length} courts
                {searchQuery && ` matching "${searchQuery}"`}
                {userLocation && ' near you'}
              </p>

              <div className="flex items-center space-x-2 text-sm text-primary-300">
                <span>Sort by:</span>
                <select className="bg-dark-200/50 border border-primary-400/30 rounded px-2 py-1 text-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="distance">Distance</option>
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                  <option value="reviews">Reviews</option>
                </select>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {courtsLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-48 bg-primary-400/20 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : viewMode === 'map' ? (
                <div className="space-y-6">
                  {/* Lazy Loaded Map */}
                  {mapLoaded ? (
                    <LazyWrapper fallback={<CourtMapSkeleton />}>
                      <LazyCourtMap
                        courts={filteredCourts}
                        userLocation={userLocation || undefined}
                        selectedCourt={selectedCourt}
                        onCourtSelect={handleCourtSelect}
                        onLocationChange={setUserLocation}
                        filters={filters}
                        onFiltersChange={setFilters}
                      />
                    </LazyWrapper>
                  ) : (
                    <div className="text-center py-16">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <MapIcon className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                        <h3 className="text-xl font-display font-bold text-white mb-2">
                          Map View
                        </h3>
                        <p className="text-primary-300 mb-6">
                          Switch to map view to see courts on an interactive map
                        </p>
                        <GameButton
                          variant="primary"
                          size="lg"
                          onClick={() => {
                            setViewMode('map');
                            setMapLoaded(true);
                          }}
                          {...mapPreload}
                          icon={<MapIcon className="w-5 h-5" />}
                        >
                          Load Map
                        </GameButton>
                      </motion.div>
                    </div>
                  )}

                  {/* Selected Court Details */}
                  {selectedCourt && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CourtCard
                        court={selectedCourt}
                        variant="detailed"
                        distance={courtsWithDistance.find(c => c.id === selectedCourt.id)?.distance}
                        onGetDirections={() => handleGetDirections(selectedCourt)}
                        onBookCourt={() => handleBookCourt(selectedCourt)}
                      />
                    </motion.div>
                  )}
                </div>
              ) : (
                /* List View */
                <div className="space-y-6">
                  {courtsWithDistance.map((court, index) => (
                    <motion.div
                      key={court.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <CourtCard
                        court={court}
                        variant="detailed"
                        distance={court.distance}
                        onViewDetails={() => setSelectedCourt(court)}
                        onGetDirections={() => handleGetDirections(court)}
                        onBookCourt={() => handleBookCourt(court)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Empty State */}
            {!courtsLoading && filteredCourts.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <MapPin className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold text-white mb-2">
                  No courts found
                </h3>
                <p className="text-primary-300 mb-6">
                  {searchQuery
                    ? `No courts match your search for "${searchQuery}"`
                    : 'No courts match your current filters'
                  }
                </p>
                <GameButton
                  variant="primary"
                  size="lg"
                  icon={<Plus className="w-5 h-5" />}
                >
                  Add a Court
                </GameButton>
              </motion.div>
            )}
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

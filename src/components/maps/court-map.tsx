'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Crosshair, 
  Layers, 
  Filter,
  Search,
  Navigation,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameButton } from '@/components/ui/game-button';
import { CourtCard } from '@/components/game/court-card';
import { Court, CourtFilters } from '@/types';

export interface CourtMapProps {
  courts: Court[];
  userLocation?: { lat: number; lng: number };
  selectedCourt?: Court | null;
  onCourtSelect?: (court: Court) => void;
  onLocationChange?: (location: { lat: number; lng: number }) => void;
  filters?: CourtFilters;
  onFiltersChange?: (filters: CourtFilters) => void;
  className?: string;
}

// Mock map implementation (in real app, would use Mapbox or Google Maps)
export function CourtMap({
  courts,
  userLocation,
  selectedCourt,
  onCourtSelect,
  onLocationChange,
  filters,
  onFiltersChange,
  className
}: CourtMapProps) {
  const [mapCenter, setMapCenter] = useState(userLocation || { lat: 34.0522, lng: -118.2437 }); // Default to LA
  const [zoom, setZoom] = useState(12);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'basketball'>('basketball');
  const mapRef = useRef<HTMLDivElement>(null);

  // Simulate getting user location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapCenter(location);
          onLocationChange?.(location);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleCourtClick = (court: Court) => {
    onCourtSelect?.(court);
    setMapCenter({ lat: court.latitude, lng: court.longitude });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getMapStyleClasses = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'bg-gradient-to-br from-green-900 via-green-800 to-green-700';
      case 'basketball':
        return 'bg-gradient-to-br from-court-600 via-court-500 to-court-400';
      default:
        return 'bg-gradient-to-br from-gray-200 via-gray-100 to-gray-50';
    }
  };

  return (
    <motion.div
      className={cn(
        'relative bg-dark-300 rounded-xl border border-primary-400/20 overflow-hidden',
        isFullscreen ? 'fixed inset-4 z-50' : 'h-96 lg:h-[500px]',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Map Container */}
      <div
        ref={mapRef}
        className={cn(
          'relative w-full h-full transition-all duration-300',
          getMapStyleClasses()
        )}
      >
        {/* Basketball court pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="court-lines w-full h-full" />
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 space-y-2">
          {/* Fullscreen Toggle */}
          <GameButton
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            className="bg-dark-300/90 backdrop-blur-sm"
          />

          {/* Map Style Toggle */}
          <GameButton
            variant="secondary"
            size="sm"
            onClick={() => setMapStyle(mapStyle === 'basketball' ? 'streets' : mapStyle === 'streets' ? 'satellite' : 'basketball')}
            icon={<Layers className="w-4 h-4" />}
            className="bg-dark-300/90 backdrop-blur-sm"
          />

          {/* Current Location */}
          <GameButton
            variant="secondary"
            size="sm"
            onClick={getCurrentLocation}
            icon={<Crosshair className="w-4 h-4" />}
            className="bg-dark-300/90 backdrop-blur-sm"
          />

          {/* Filters Toggle */}
          <GameButton
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-4 h-4" />}
            className="bg-dark-300/90 backdrop-blur-sm"
          />
        </div>

        {/* User Location Marker */}
        {userLocation && (
          <motion.div
            className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-20"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 0 0 rgba(59, 130, 246, 0.7)',
                '0 0 0 10px rgba(59, 130, 246, 0)',
                '0 0 0 0 rgba(59, 130, 246, 0)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Court Markers */}
        {courts.map((court, index) => {
          const isSelected = selectedCourt?.id === court.id;
          // Simulate court positions around the map center
          const offsetX = (index % 5 - 2) * 80 + Math.random() * 40 - 20;
          const offsetY = (Math.floor(index / 5) % 3 - 1) * 60 + Math.random() * 30 - 15;
          
          return (
            <motion.div
              key={court.id}
              className={cn(
                'absolute cursor-pointer z-10',
                isSelected ? 'z-30' : 'z-10'
              )}
              style={{
                left: `calc(50% + ${offsetX}px)`,
                top: `calc(50% + ${offsetY}px)`,
                transform: 'translate(-50%, -50%)'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleCourtClick(court)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Court Marker */}
              <div className={cn(
                'w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all',
                court.courtType === 'indoor' 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-court-500 hover:bg-court-600',
                isSelected && 'ring-4 ring-primary-400 ring-opacity-50'
              )}>
                <span className="text-white text-xs font-bold">
                  {court.courtType === 'indoor' ? '🏢' : '🌳'}
                </span>
              </div>

              {/* Court Rating Badge */}
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {court.rating.toFixed(1)}
              </div>

              {/* Court Popup */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CourtCard
                      court={court}
                      variant="map-popup"
                      onViewDetails={() => console.log('View details:', court.id)}
                      onGetDirections={() => console.log('Get directions:', court.id)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-dark-300/90 backdrop-blur-sm rounded-lg p-3 border border-primary-400/20">
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-court-500 rounded-full border border-white" />
              <span className="text-primary-200">Outdoor Courts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border border-white" />
              <span className="text-primary-200">Indoor Courts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
              <span className="text-primary-200">Your Location</span>
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-1">
          <GameButton
            variant="secondary"
            size="sm"
            onClick={() => setZoom(Math.min(zoom + 1, 18))}
            className="bg-dark-300/90 backdrop-blur-sm w-10 h-10 p-0"
          >
            +
          </GameButton>
          <GameButton
            variant="secondary"
            size="sm"
            onClick={() => setZoom(Math.max(zoom - 1, 8))}
            className="bg-dark-300/90 backdrop-blur-sm w-10 h-10 p-0"
          >
            -
          </GameButton>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="absolute top-0 left-0 w-80 h-full bg-dark-300/95 backdrop-blur-sm border-r border-primary-400/20 z-40"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-white">Filters</h3>
                <GameButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  ×
                </GameButton>
              </div>

              {/* Court Type Filter */}
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Court Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters?.courtType === undefined || filters?.courtType === 'outdoor'}
                      onChange={(e) => onFiltersChange?.({
                        ...filters,
                        courtType: e.target.checked ? 'outdoor' : undefined
                      })}
                      className="rounded border-primary-400/30 bg-dark-200/50 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-primary-200">🌳 Outdoor Courts</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters?.courtType === undefined || filters?.courtType === 'indoor'}
                      onChange={(e) => onFiltersChange?.({
                        ...filters,
                        courtType: e.target.checked ? 'indoor' : undefined
                      })}
                      className="rounded border-primary-400/30 bg-dark-200/50 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-primary-200">🏢 Indoor Courts</span>
                  </label>
                </div>
              </div>

              {/* Amenities Filter */}
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Amenities
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters?.hasLighting}
                      onChange={(e) => onFiltersChange?.({
                        ...filters,
                        hasLighting: e.target.checked
                      })}
                      className="rounded border-primary-400/30 bg-dark-200/50 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-primary-200">💡 Lighting</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters?.hasParking}
                      onChange={(e) => onFiltersChange?.({
                        ...filters,
                        hasParking: e.target.checked
                      })}
                      className="rounded border-primary-400/30 bg-dark-200/50 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-primary-200">🚗 Parking</span>
                  </label>
                </div>
              </div>

              {/* Distance Filter */}
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Max Distance: {filters?.maxDistance || 25} miles
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={filters?.maxDistance || 25}
                  onChange={(e) => onFiltersChange?.({
                    ...filters,
                    maxDistance: parseInt(e.target.value)
                  })}
                  className="w-full h-2 bg-dark-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Minimum Rating: {filters?.minRating || 0} stars
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters?.minRating || 0}
                  onChange={(e) => onFiltersChange?.({
                    ...filters,
                    minRating: parseFloat(e.target.value)
                  })}
                  className="w-full h-2 bg-dark-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {courts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-300/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-primary-200">Loading courts...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

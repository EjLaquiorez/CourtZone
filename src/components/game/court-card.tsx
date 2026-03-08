'use client';

import { motion } from 'framer-motion';
import { 
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
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameButton } from '@/components/ui/game-button';
import { Court } from '@/types';
import { formatDistance, formatTime } from '@/lib/utils';

interface CourtCardProps {
  court: Court;
  variant?: 'compact' | 'detailed' | 'map-popup';
  distance?: number; // in miles
  showActions?: boolean;
  userLocation?: { lat: number; lng: number };
  onViewDetails?: () => void;
  onGetDirections?: () => void;
  onBookCourt?: () => void;
  onAddToFavorites?: () => void;
  className?: string;
}

export function CourtCard({
  court,
  variant = 'detailed',
  distance,
  showActions = true,
  userLocation,
  onViewDetails,
  onGetDirections,
  onBookCourt,
  onAddToFavorites,
  className
}: CourtCardProps) {
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

  const getCourtTypeColor = (type: string) => {
    return type === 'indoor' ? 'text-blue-400' : 'text-court-500';
  };

  const getCourtTypeIcon = (type: string) => {
    return type === 'indoor' ? '🏢' : '🌳';
  };

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'bg-gradient-to-r from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-lg p-4 border border-primary-400/20',
          'hover:border-primary-400/40 transition-all duration-300',
          className
        )}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Court Type Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-court-500 to-court-600 rounded-full flex items-center justify-center">
              <span className="text-xl">{getCourtTypeIcon(court.courtType)}</span>
            </div>

            {/* Court Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-primary-100 truncate">{court.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-primary-300">
                <span className={getCourtTypeColor(court.courtType)}>
                  {court.courtType === 'indoor' ? 'Indoor' : 'Outdoor'}
                </span>
                <span>•</span>
                <div className="flex items-center">
                  {renderStars(court.rating)}
                  <span className="ml-1">({court.reviewCount})</span>
                </div>
                {distance && (
                  <>
                    <span>•</span>
                    <span>{formatDistance(distance)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {showActions && (
            <div className="flex items-center space-x-2">
              <GameButton variant="secondary" size="sm" onClick={onGetDirections}>
                <Navigation className="w-4 h-4" />
              </GameButton>
              <GameButton variant="primary" size="sm" onClick={onViewDetails}>
                View
              </GameButton>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === 'map-popup') {
    return (
      <div className={cn(
        'bg-dark-300 rounded-lg p-4 border border-primary-400/20 min-w-[280px]',
        className
      )}>
        <div className="space-y-3">
          {/* Header */}
          <div>
            <h3 className="font-bold text-primary-100 text-lg">{court.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-primary-300">
              <span className={getCourtTypeColor(court.courtType)}>
                {getCourtTypeIcon(court.courtType)} {court.courtType === 'indoor' ? 'Indoor' : 'Outdoor'}
              </span>
              <span>•</span>
              <div className="flex items-center">
                {renderStars(court.rating)}
                <span className="ml-1">({court.reviewCount})</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-primary-200">{court.address}</p>
          </div>

          {/* Amenities */}
          <div className="flex items-center space-x-4 text-xs text-primary-300">
            {court.hasLighting && (
              <div className="flex items-center space-x-1">
                <Lightbulb className="w-3 h-3" />
                <span>Lighting</span>
              </div>
            )}
            {court.hasParking && (
              <div className="flex items-center space-x-1">
                <Car className="w-3 h-3" />
                <span>Parking</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <GameButton variant="secondary" size="sm" onClick={onGetDirections} className="flex-1">
              Directions
            </GameButton>
            <GameButton variant="primary" size="sm" onClick={onViewDetails} className="flex-1">
              Details
            </GameButton>
          </div>
        </div>
      </div>
    );
  }

  // Default: detailed variant
  return (
    <motion.div
      className={cn(
        'bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20',
        'hover:border-primary-400/40 transition-all duration-300 relative overflow-hidden',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 text-6xl opacity-5">🏀</div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Court Type Icon */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-court-500 to-court-600 rounded-full flex items-center justify-center court-shadow">
              <span className="text-2xl">{getCourtTypeIcon(court.courtType)}</span>
            </div>
            {/* Verified badge */}
            {court.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Court Info */}
          <div>
            <h3 className="text-xl font-display font-bold text-white mb-1">{court.name}</h3>
            <div className="flex items-center space-x-3 text-sm text-primary-300">
              <span className={cn('font-medium', getCourtTypeColor(court.courtType))}>
                {court.courtType === 'indoor' ? 'Indoor Court' : 'Outdoor Court'}
              </span>
              <span>•</span>
              <div className="flex items-center">
                {renderStars(court.rating)}
                <span className="ml-1 font-medium">({court.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Distance badge */}
        {distance && (
          <div className="px-3 py-1 bg-primary-500/20 text-primary-400 text-sm font-medium rounded-full border border-primary-500/30">
            {formatDistance(distance)}
          </div>
        )}
      </div>

      {/* Address */}
      <div className="flex items-start space-x-2 mb-4">
        <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
        <p className="text-primary-200">{court.address}</p>
      </div>

      {/* Amenities Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={cn(
          'flex items-center space-x-2 p-3 rounded-lg',
          court.hasLighting ? 'bg-court-500/20 text-court-400' : 'bg-dark-200/50 text-gray-400'
        )}>
          <Lightbulb className="w-5 h-5" />
          <span className="text-sm font-medium">Lighting</span>
        </div>
        
        <div className={cn(
          'flex items-center space-x-2 p-3 rounded-lg',
          court.hasParking ? 'bg-blue-500/20 text-blue-400' : 'bg-dark-200/50 text-gray-400'
        )}>
          <Car className="w-5 h-5" />
          <span className="text-sm font-medium">Parking</span>
        </div>

        <div className="flex items-center space-x-2 p-3 rounded-lg bg-primary-500/20 text-primary-400">
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">Available</span>
        </div>

        <div className="flex items-center space-x-2 p-3 rounded-lg bg-yellow-500/20 text-yellow-400">
          <Clock className="w-5 h-5" />
          <span className="text-sm font-medium">24/7</span>
        </div>
      </div>

      {/* Additional Amenities */}
      {court.amenities && court.amenities.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-primary-200 mb-2">Additional Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {court.amenities.map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-dark-200/50 text-primary-300 text-xs rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Photos Preview */}
      {court.photos && court.photos.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Camera className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-200">Photos ({court.photos.length})</span>
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {court.photos.slice(0, 4).map((photo, index) => (
              <div
                key={index}
                className="w-20 h-20 bg-dark-200 rounded-lg flex-shrink-0 overflow-hidden"
              >
                <img
                  src={photo}
                  alt={`${court.name} photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {court.photos.length > 4 && (
              <div className="w-20 h-20 bg-dark-200 rounded-lg flex-shrink-0 flex items-center justify-center text-primary-300 text-xs">
                +{court.photos.length - 4}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-primary-400/20">
          <div className="flex items-center space-x-2">
            <GameButton
              variant="secondary"
              size="sm"
              onClick={onGetDirections}
              icon={<Navigation className="w-4 h-4" />}
            >
              Directions
            </GameButton>
            <GameButton
              variant="ghost"
              size="sm"
              onClick={onAddToFavorites}
              icon={<Star className="w-4 h-4" />}
            >
              Save
            </GameButton>
          </div>

          <div className="flex items-center space-x-2">
            <GameButton
              variant="primary"
              size="sm"
              onClick={onBookCourt}
              icon={<Calendar className="w-4 h-4" />}
            >
              Book Court
            </GameButton>
            <GameButton
              variant="secondary"
              size="sm"
              onClick={onViewDetails}
            >
              View Details
            </GameButton>
          </div>
        </div>
      )}
    </motion.div>
  );
}

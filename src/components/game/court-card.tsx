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
    return type === 'indoor' ? 'text-slate-300' : 'text-slate-300';
  };

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'rounded-lg border border-slate-800 bg-slate-900/80 p-4',
          'transition-all duration-200 hover:border-slate-700 hover:bg-slate-900',
          className
        )}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Court Info */}
            <div className="flex-1 min-w-0">
              <h3 className="truncate text-sm font-medium text-slate-100">{court.name}</h3>
              <div className="mt-0.5 flex items-center space-x-2 text-xs text-slate-500">
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
        'min-w-[280px] rounded-lg border border-slate-800 bg-slate-900/90 p-4',
        className
      )}>
        <div className="space-y-3">
          {/* Header */}
          <div>
            <h3 className="text-sm font-medium text-slate-100">{court.name}</h3>
            <div className="mt-0.5 flex items-center space-x-2 text-xs text-slate-500">
              <span className={getCourtTypeColor(court.courtType)}>
                {court.courtType === 'indoor' ? 'Indoor' : 'Outdoor'}
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
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
            <p className="text-xs text-slate-300">{court.address}</p>
          </div>

          {/* Amenities */}
          <div className="flex items-center space-x-4 text-[11px] text-slate-500">
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
        'relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-6',
        'transition-all duration-200 hover:border-slate-700 hover:bg-slate-900',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Court Info */}
          <div>
            <h3 className="mb-1 text-sm font-medium text-slate-100">{court.name}</h3>
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <span className={cn('font-medium', getCourtTypeColor(court.courtType))}>
                {court.courtType === 'indoor' ? 'Indoor court' : 'Outdoor court'}
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
          <div className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
            {formatDistance(distance)}
          </div>
        )}
      </div>

      {/* Address */}
      <div className="flex items-start space-x-2 mb-4">
        <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500" />
        <p className="text-sm text-slate-300">{court.address}</p>
      </div>

      {/* Amenities Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={cn(
          'flex items-center space-x-2 rounded-lg p-3 text-xs',
          court.hasLighting ? 'bg-slate-900 text-slate-200 border border-slate-700' : 'bg-slate-900 text-slate-500 border border-slate-800'
        )}>
          <Lightbulb className="w-5 h-5" />
          <span className="text-sm font-medium">Lighting</span>
        </div>
        
        <div className={cn(
          'flex items-center space-x-2 rounded-lg p-3 text-xs',
          court.hasParking ? 'bg-slate-900 text-slate-200 border border-slate-700' : 'bg-slate-900 text-slate-500 border border-slate-800'
        )}>
          <Car className="w-5 h-5" />
          <span className="text-sm font-medium">Parking</span>
        </div>

        <div className="flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-slate-300">
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">Available</span>
        </div>

        <div className="flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-slate-300">
          <Clock className="w-5 h-5" />
          <span className="text-sm font-medium">24/7</span>
        </div>
      </div>

      {/* Additional Amenities */}
      {court.amenities && court.amenities.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-2 text-xs font-medium text-slate-400">Additional amenities</h4>
          <div className="flex flex-wrap gap-2">
            {court.amenities.map((amenity, index) => (
              <span
                key={index}
                className="rounded-full bg-slate-900 px-2 py-1 text-[11px] text-slate-400 border border-slate-800"
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
          <div className="mb-2 flex items-center space-x-2">
            <Camera className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-400">Photos ({court.photos.length})</span>
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {court.photos.slice(0, 4).map((photo, index) => (
              <div
                key={index}
                className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800"
              >
                <img
                  src={photo}
                  alt={`${court.name} photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {court.photos.length > 4 && (
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs text-slate-400">
                +{court.photos.length - 4}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
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

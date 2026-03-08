'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign,
  Check,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameButton } from '@/components/ui/game-button';
import { useCourtAvailability, useBookCourt } from '@/lib/hooks/use-api';

interface CourtBookingCalendarProps {
  courtId: string;
  courtName: string;
  hourlyRate?: number;
  onBookingComplete?: (booking: any) => void;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
  cost: number;
  available: boolean;
}

export function CourtBookingCalendar({ 
  courtId, 
  courtName, 
  hourlyRate = 0,
  onBookingComplete 
}: CourtBookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Format date for API
  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch availability for selected date
  const { data: availabilityData, isLoading } = useCourtAvailability(
    courtId,
    formatDateForAPI(selectedDate)
  );

  // Book court mutation
  const bookCourtMutation = useBookCourt({
    onSuccess: (data) => {
      console.log('Court booked successfully:', data);
      setShowBookingForm(false);
      setSelectedSlot(null);
      onBookingComplete?.(data);
    },
    onError: (error) => {
      console.error('Failed to book court:', error);
    }
  });

  // Generate time slots for display
  const generateTimeSlots = (): TimeSlot[] => {
    if (!availabilityData?.data?.availableSlots) {
      return [];
    }

    return availabilityData.data.availableSlots.map((slot: any) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      cost: slot.cost,
      available: true
    }));
  };

  const timeSlots = generateTimeSlots();

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle slot selection
  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
  };

  // Handle booking confirmation
  const handleBookingConfirm = () => {
    if (!selectedSlot) return;

    bookCourtMutation.mutate({
      courtId,
      data: {
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: notes.trim() || undefined
      }
    });
  };

  // Check if date is today or future
  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display font-bold text-white">Book Court</h3>
          <p className="text-primary-300">{courtName}</p>
        </div>
        {hourlyRate > 0 && (
          <div className="flex items-center space-x-2 text-primary-200">
            <DollarSign className="w-5 h-5" />
            <span className="font-medium">${hourlyRate}/hour</span>
          </div>
        )}
      </div>

      {/* Date Navigation */}
      <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
        <div className="flex items-center justify-between mb-4">
          <GameButton
            variant="ghost"
            size="sm"
            onClick={() => navigateDate('prev')}
            disabled={!isDateSelectable(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
            icon={<ChevronLeft className="w-4 h-4" />}
          />
          
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-sm text-primary-300">
              {selectedDate.toDateString() === new Date().toDateString() ? 'Today' : 
               selectedDate.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString() ? 'Tomorrow' : ''}
            </div>
          </div>

          <GameButton
            variant="ghost"
            size="sm"
            onClick={() => navigateDate('next')}
            icon={<ChevronRight className="w-4 h-4" />}
          />
        </div>

        {/* Time Slots */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-primary-300">Loading availability...</p>
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-primary-200 font-medium">No available time slots</p>
            <p className="text-primary-300 text-sm">Try selecting a different date</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {timeSlots.map((slot, index) => (
              <motion.button
                key={`${slot.startTime}-${slot.endTime}`}
                className={cn(
                  'p-4 rounded-lg border transition-all duration-200',
                  slot.available
                    ? 'border-primary-400/30 bg-primary-500/10 hover:bg-primary-500/20 hover:border-primary-400/50'
                    : 'border-gray-600/30 bg-gray-500/10 cursor-not-allowed opacity-50'
                )}
                onClick={() => slot.available && handleSlotSelect(slot)}
                disabled={!slot.available}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="text-center">
                  <div className="font-medium text-primary-100">
                    {formatTime(slot.startTime)}
                  </div>
                  <div className="text-sm text-primary-300">
                    {slot.duration} min
                  </div>
                  {slot.cost > 0 && (
                    <div className="text-sm text-primary-400 font-medium">
                      ${slot.cost}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedSlot && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-dark-300 to-dark-400 rounded-xl p-6 border border-primary-400/20 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-display font-bold text-white">Confirm Booking</h4>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-primary-300 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Booking Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 text-primary-200">
                <MapPin className="w-5 h-5 text-primary-400" />
                <span>{courtName}</span>
              </div>
              
              <div className="flex items-center space-x-3 text-primary-200">
                <Calendar className="w-5 h-5 text-primary-400" />
                <span>{selectedDate.toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center space-x-3 text-primary-200">
                <Clock className="w-5 h-5 text-primary-400" />
                <span>
                  {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                  <span className="text-primary-300 ml-2">({selectedSlot.duration} minutes)</span>
                </span>
              </div>
              
              {selectedSlot.cost > 0 && (
                <div className="flex items-center space-x-3 text-primary-200">
                  <DollarSign className="w-5 h-5 text-primary-400" />
                  <span className="font-medium">${selectedSlot.cost}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special requests or notes..."
                className="w-full px-4 py-3 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:border-primary-400 resize-none"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <GameButton
                variant="ghost"
                size="md"
                onClick={() => setShowBookingForm(false)}
                className="flex-1"
              >
                Cancel
              </GameButton>
              <GameButton
                variant="primary"
                size="md"
                onClick={handleBookingConfirm}
                loading={bookCourtMutation.isPending}
                icon={<Check className="w-4 h-4" />}
                className="flex-1"
                glow
              >
                Confirm Booking
              </GameButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

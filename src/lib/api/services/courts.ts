// Courts API services
import { apiClient, withCache, withRetry } from '../client';
import {
  Court,
  CourtFilters,
  PaginatedResponse,
  ApiResponse
} from '@/types';
import { CreateCourtFormData } from '@/lib/validation';

export interface CourtAvailability {
  courtId: string;
  date: string;
  timeSlots: Array<{
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    gameId?: string;
    reservedBy?: string;
  }>;
}

export interface CourtReview {
  id: string;
  courtId: string;
  userId: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: Date;
  user: {
    username: string;
    avatar?: string;
  };
}

export interface CourtReservation {
  id: string;
  courtId: string;
  userId: string;
  gameId?: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
  cost?: number;
  createdAt: Date;
}

export const courtsService = {
  // Get paginated courts list
  async getCourts(
    filters?: CourtFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Court>>> {
    const params = { ...filters, page, limit };
    return withCache(
      `courts-${JSON.stringify(params)}`,
      () => apiClient.get<PaginatedResponse<Court>>('/courts', params),
      5 * 60 * 1000 // 5 minutes cache
    );
  },

  // Get court by ID
  async getCourtById(courtId: string): Promise<ApiResponse<Court>> {
    return withCache(
      `court-${courtId}`,
      () => apiClient.get<Court>(`/courts/${courtId}`),
      3 * 60 * 1000 // 3 minutes cache
    );
  },

  // Create new court
  async createCourt(data: CreateCourtFormData): Promise<ApiResponse<Court>> {
    return withRetry(() =>
      apiClient.post<Court>('/courts', data)
    );
  },

  // Update court
  async updateCourt(courtId: string, data: Partial<Court>): Promise<ApiResponse<Court>> {
    return apiClient.patch<Court>(`/courts/${courtId}`, data);
  },

  // Delete court
  async deleteCourt(courtId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/courts/${courtId}`);
  },

  // Get nearby courts
  async getNearbyCourts(
    latitude: number,
    longitude: number,
    radius: number = 10,
    filters?: CourtFilters
  ): Promise<ApiResponse<Court[]>> {
    const params = { latitude, longitude, radius, ...filters };
    return withCache(
      `nearby-courts-${JSON.stringify(params)}`,
      () => apiClient.get<Court[]>('/courts/nearby', params),
      3 * 60 * 1000 // 3 minutes cache
    );
  },

  // Search courts
  async searchCourts(
    query: string,
    filters?: CourtFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Court>>> {
    const params = { q: query, ...filters, page, limit };
    return apiClient.get<PaginatedResponse<Court>>('/courts/search', params);
  },

  // Get court availability
  async getCourtAvailability(
    courtId: string,
    date?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<any>> {
    const params: any = {};
    if (date) params.date = date;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return withCache(
      `court-availability-${courtId}-${JSON.stringify(params)}`,
      () => apiClient.get<any>(`/courts/${courtId}/availability`, params),
      5 * 60 * 1000 // 5 minutes cache
    );
  },

  // Book court
  async bookCourt(courtId: string, data: {
    startTime: string;
    endTime: string;
    gameId?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return withRetry(() =>
      apiClient.post<any>(`/courts/${courtId}/book`, data)
    );
  },

  // Cancel court reservation
  async cancelReservation(reservationId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/courts/reservations/${reservationId}`);
  },

  // Get user's court reservations
  async getUserCourtReservations(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = { status, page, limit };
    return apiClient.get<PaginatedResponse<any>>(`/users/${userId}/reservations`, params);
  },

  // Get court reviews
  async getCourtReviews(
    courtId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<CourtReview>>> {
    const params = { page, limit };
    return withCache(
      `court-reviews-${courtId}-${page}-${limit}`,
      () => apiClient.get<PaginatedResponse<CourtReview>>(`/courts/${courtId}/reviews`, params),
      5 * 60 * 1000 // 5 minutes cache
    );
  },

  // Add court review
  async addCourtReview(
    courtId: string,
    data: {
      rating: number;
      comment: string;
      photos?: File[];
    }
  ): Promise<ApiResponse<CourtReview>> {
    const formData = new FormData();
    formData.append('rating', data.rating.toString());
    formData.append('comment', data.comment);

    if (data.photos) {
      data.photos.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo);
      });
    }

    return apiClient.post<CourtReview>(`/courts/${courtId}/reviews`, formData);
  },

  // Update court review
  async updateCourtReview(
    reviewId: string,
    data: {
      rating?: number;
      comment?: string;
    }
  ): Promise<ApiResponse<CourtReview>> {
    return apiClient.patch<CourtReview>(`/courts/reviews/${reviewId}`, data);
  },

  // Delete court review
  async deleteCourtReview(reviewId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/courts/reviews/${reviewId}`);
  },

  // Upload court photos
  async uploadCourtPhotos(courtId: string, photos: File[]): Promise<ApiResponse<{ photoUrls: string[] }>> {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append(`photos[${index}]`, photo);
    });

    return apiClient.post(`/courts/${courtId}/photos`, formData);
  },

  // Report court issue
  async reportCourtIssue(
    courtId: string,
    data: {
      type: 'maintenance' | 'safety' | 'accessibility' | 'other';
      description: string;
      severity: 'low' | 'medium' | 'high';
      photos?: File[];
    }
  ): Promise<ApiResponse<void>> {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('description', data.description);
    formData.append('severity', data.severity);

    if (data.photos) {
      data.photos.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo);
      });
    }

    return apiClient.post(`/courts/${courtId}/report`, formData);
  },

  // Get court statistics
  async getCourtStats(courtId: string): Promise<ApiResponse<{
    totalGames: number;
    averageRating: number;
    totalReviews: number;
    utilizationRate: number;
    peakHours: Array<{ hour: number; usage: number }>;
    monthlyStats: Array<{ month: string; games: number; revenue?: number }>;
  }>> {
    return withCache(
      `court-stats-${courtId}`,
      () => apiClient.get(`/courts/${courtId}/stats`),
      10 * 60 * 1000 // 10 minutes cache
    );
  },

  // Get popular courts
  async getPopularCourts(
    latitude?: number,
    longitude?: number,
    radius?: number,
    limit: number = 10
  ): Promise<ApiResponse<Court[]>> {
    const params = { latitude, longitude, radius, limit };
    return withCache(
      `popular-courts-${JSON.stringify(params)}`,
      () => apiClient.get<Court[]>('/courts/popular', params),
      15 * 60 * 1000 // 15 minutes cache
    );
  },

  // Check court name availability
  async checkCourtNameAvailability(name: string): Promise<ApiResponse<{ available: boolean }>> {
    return apiClient.get<{ available: boolean }>(`/courts/check-name/${encodeURIComponent(name)}`);
  },
};

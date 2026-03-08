// API client configuration and utilities
import { ApiResponse, PaginatedResponse } from '@/types';

// Development mode flag
const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
};

// Mock data for development
const mockApiResponses = {
  '/api/teams': () => ({
    data: {
      data: [
        {
          id: 'team1',
          name: 'Street Ballers',
          captainId: 'user1',
          maxSize: 12,
          minSkillLevel: 6,
          maxSkillLevel: 10,
          description: 'Competitive street basketball team',
          isPublic: true,
          rating: 1750,
          gamesPlayed: 45,
          wins: 32,
          createdAt: new Date('2023-06-01'),
          captain: {
            id: 'user1',
            username: 'CourtKing23',
            email: 'courtking@example.com',
            rating: 1847,
            skillLevel: 8,
            position: 'PG',
            maxDistance: 25,
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          members: [],
          memberCount: 8
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    },
    success: true,
    message: 'Success'
  }),

  '/api/games': () => ({
    data: {
      data: [
        {
          id: 'game1',
          hostTeamId: 'team1',
          courtId: 'court1',
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          durationMinutes: 120,
          gameType: 'pickup',
          status: 'open',
          minSkillLevel: 6,
          maxSkillLevel: 10,
          maxDistance: 25,
          createdAt: new Date()
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    },
    success: true,
    message: 'Success'
  }),

  '/api/courts': () => ({
    data: {
      data: [
        {
          id: 'court1',
          name: 'Central Park Basketball Courts',
          address: '1 Central Park West, New York, NY 10023',
          latitude: 40.7829,
          longitude: -73.9654,
          courtType: 'outdoor',
          surfaceType: 'Asphalt',
          hasLighting: true,
          hasParking: false,
          rating: 4.5,
          reviewCount: 127,
          isVerified: true,
          createdAt: new Date(),
          photos: [],
          amenities: ['Lighting', 'Multiple Courts', 'Water Fountain']
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    },
    success: true,
    message: 'Success'
  })
};

// Simulate API delay
const simulateApiDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// API client class
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Set authorization token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove authorization token
  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Use mock data in development mode
    if (isDevelopmentMode()) {
      console.log(`🔧 Development mode: Using mock data for ${endpoint}`);
      await simulateApiDelay(300); // Simulate network delay

      // Check if we have mock data for this endpoint
      const mockResponse = mockApiResponses[endpoint as keyof typeof mockApiResponses];
      if (mockResponse) {
        return mockResponse() as ApiResponse<T>;
      }

      // Default mock response for unknown endpoints
      return {
        data: {} as T,
        success: true,
        message: 'Mock response'
      };
    }

    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);

      // Fallback to mock data if real API fails in development
      if (isDevelopmentMode()) {
        console.log(`🔧 API failed, falling back to mock data for ${endpoint}`);
        const mockResponse = mockApiResponses[endpoint as keyof typeof mockApiResponses];
        if (mockResponse) {
          return mockResponse() as ApiResponse<T>;
        }
      }

      throw error;
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create default API client instance
export const apiClient = new ApiClient();

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Response interceptor for error handling
export const handleApiError = (error: any): never => {
  if (error instanceof ApiError) {
    throw error;
  }

  if (error.response) {
    throw new ApiError(
      error.response.data?.message || 'An error occurred',
      error.response.status,
      error.response.data?.code,
      error.response.data?.details
    );
  }

  throw new ApiError(error.message || 'Network error occurred');
};

// Retry utility for failed requests
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i === maxRetries) {
        break;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError!;
};

// Cache utility for GET requests
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const withCache = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> => {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < cached.ttl) {
    return cached.data;
  }

  const data = await fn();
  cache.set(key, { data, timestamp: now, ttl });

  return data;
};

// Clear cache utility
export const clearCache = (pattern?: string) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

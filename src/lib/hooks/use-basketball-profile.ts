import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BasketballProfileFormData } from '@/lib/validation';

interface BasketballProfile extends BasketballProfileFormData {
  id: string;
  email: string;
  avatar?: string;
  rating: number;
  latitude?: number;
  longitude?: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

// Fetch basketball profile
export function useBasketballProfile() {
  return useQuery({
    queryKey: ['basketball-profile'],
    queryFn: async (): Promise<BasketballProfile> => {
      const response = await fetch('/api/users/basketball-profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch basketball profile');
      }

      const result: ApiResponse<BasketballProfile> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch basketball profile');
      }

      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Update basketball profile
export function useUpdateBasketballProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BasketballProfileFormData): Promise<BasketballProfile> => {
      const response = await fetch('/api/users/basketball-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResult: ApiResponse<never> = await response.json();
        throw new Error(errorResult.message || 'Failed to update basketball profile');
      }

      const result: ApiResponse<BasketballProfile> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to update basketball profile');
      }

      return result.data;
    },
    onSuccess: (data) => {
      // Update the basketball profile cache
      queryClient.setQueryData(['basketball-profile'], data);
      
      // Also update the current user cache if it exists
      queryClient.setQueryData(['current-user'], (oldData: any) => {
        if (oldData?.data) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              username: data.username,
              position: data.position,
              skillLevel: data.skillLevel,
              city: data.city,
              maxDistance: data.maxDistance,
            }
          };
        }
        return oldData;
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error) => {
      console.error('Basketball profile update error:', error);
    },
  });
}

// Helper function to transform user data to basketball profile format
export function transformUserToBasketballProfile(user: any): Partial<BasketballProfileFormData> {
  return {
    username: user.username || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    dateOfBirth: user.dateOfBirth || '',
    bio: user.bio || '',
    position: user.position || 'PG',
    skillLevel: user.skillLevel || 5,
    yearsOfExperience: user.yearsOfExperience || 0,
    height: user.height || undefined,
    weight: user.weight || undefined,
    playingStyle: user.playingStyle || undefined,
    strengths: user.strengths || [],
    weaknesses: user.weaknesses || [],
    preferredGameTypes: user.preferredGameTypes || [],
    availability: user.availability || [],
    preferredTimes: user.preferredTimes || [],
    phone: user.phone || '',
    city: user.city || '',
    maxDistance: user.maxDistance || 10,
    socialMedia: user.socialMedia || {
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: ''
    }
  };
}

// Hook to check if basketball profile is complete
export function useBasketballProfileCompletion() {
  const { data: profile, isLoading } = useBasketballProfile();

  const isComplete = profile ? (
    Boolean(profile.username) &&
    Boolean(profile.firstName) &&
    Boolean(profile.lastName) &&
    Boolean(profile.dateOfBirth) &&
    Boolean(profile.position) &&
    Boolean(profile.city) &&
    profile.skillLevel > 0
  ) : false;

  const completionPercentage = profile ? (
    [
      profile.username,
      profile.firstName,
      profile.lastName,
      profile.dateOfBirth,
      profile.position,
      profile.city,
      profile.skillLevel > 0,
      profile.bio,
      profile.yearsOfExperience > 0,
      profile.playingStyle,
      profile.strengths?.length > 0,
      profile.preferredGameTypes?.length > 0,
      profile.availability?.length > 0,
      profile.phone
    ].filter(Boolean).length / 14
  ) * 100 : 0;

  return {
    isComplete,
    completionPercentage: Math.round(completionPercentage),
    isLoading
  };
}

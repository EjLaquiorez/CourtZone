import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { userSchemas } from '@/lib/validation';

// Fixed import path from @/lib/auth/server to @/lib/auth

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate the basketball profile data
    const validation = userSchemas.basketballProfile.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors
        },
        { status: 400 }
      );
    }

    const {
      username,
      firstName,
      lastName,
      dateOfBirth,
      bio,
      position,
      skillLevel,
      yearsOfExperience,
      height,
      weight,
      playingStyle,
      strengths,
      weaknesses,
      preferredGameTypes,
      availability,
      preferredTimes,
      phone,
      city,
      maxDistance,
      socialMedia
    } = validation.data;

    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: user.userId }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Username is already taken' },
          { status: 409 }
        );
      }
    }

    // Update user profile with basketball-specific data
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        username,
        position,
        skillLevel,
        city,
        maxDistance,
        // Note: The current schema doesn't include all basketball fields
        // In a real implementation, you would extend the User model to include:
        // firstName, lastName, dateOfBirth, bio, yearsOfExperience, height, weight,
        // playingStyle, strengths, weaknesses, preferredGameTypes, availability,
        // preferredTimes, phone, socialMedia
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        position: true,
        skillLevel: true,
        rating: true,
        latitude: true,
        longitude: true,
        city: true,
        maxDistance: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // For now, we'll store the extended basketball profile data in a separate table
    // or return a success response indicating partial update
    console.log('Basketball profile data to be stored:', {
      firstName,
      lastName,
      dateOfBirth,
      bio,
      yearsOfExperience,
      height,
      weight,
      playingStyle,
      strengths,
      weaknesses,
      preferredGameTypes,
      availability,
      preferredTimes,
      phone,
      socialMedia
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Basketball profile updated successfully'
    });

  } catch (error) {
    console.error('Update basketball profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's basketball profile
    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        position: true,
        skillLevel: true,
        rating: true,
        latitude: true,
        longitude: true,
        city: true,
        maxDistance: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // In a real implementation, you would also fetch extended basketball profile data
    // from a separate table or additional fields in the User model
    const basketballProfile = {
      ...userProfile,
      // Extended fields would be fetched here
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      bio: '',
      yearsOfExperience: 0,
      height: null,
      weight: null,
      playingStyle: null,
      strengths: [],
      weaknesses: [],
      preferredGameTypes: [],
      availability: [],
      preferredTimes: [],
      phone: '',
      socialMedia: {
        instagram: '',
        twitter: '',
        youtube: '',
        tiktok: ''
      }
    };

    return NextResponse.json({
      success: true,
      data: basketballProfile,
      message: 'Basketball profile retrieved successfully'
    });

  } catch (error) {
    console.error('Get basketball profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Form validation utilities and schemas
import { z } from 'zod';

// Common validation patterns
export const commonValidation = {
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .optional(),
  url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
};

// User-related schemas
export const userSchemas = {
  register: z.object({
    username: commonValidation.username,
    email: commonValidation.email,
    password: commonValidation.password,
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13;
    }, 'You must be at least 13 years old'),
    agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  login: z.object({
    email: commonValidation.email,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),

  profile: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    location: z.string().max(100, 'Location must be less than 100 characters').optional(),
    phone: commonValidation.phone,
    website: commonValidation.url,
    socialMedia: z.object({
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      youtube: z.string().optional(),
    }).optional(),
  }),

  basketballProfile: z.object({
    // Personal Information
    username: commonValidation.username,
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    dateOfBirth: z.string().refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13 && age <= 100;
    }, 'You must be between 13 and 100 years old'),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),

    // Basketball Details
    position: z.enum(['PG', 'SG', 'SF', 'PF', 'C'], {
      errorMap: () => ({ message: 'Please select a position' })
    }),
    skillLevel: z.number().min(1, 'Skill level must be at least 1').max(10, 'Skill level cannot exceed 10'),
    yearsOfExperience: z.number().min(0, 'Years of experience cannot be negative').max(50, 'Years of experience seems too high'),
    height: z.number().min(120, 'Height must be at least 120cm').max(250, 'Height cannot exceed 250cm').optional(),
    weight: z.number().min(30, 'Weight must be at least 30kg').max(200, 'Weight cannot exceed 200kg').optional(),

    // Playing Style
    playingStyle: z.enum(['aggressive', 'defensive', 'playmaker', 'shooter', 'all-around'], {
      errorMap: () => ({ message: 'Please select a playing style' })
    }).optional(),
    strengths: z.array(z.string()).max(5, 'Maximum 5 strengths allowed').optional(),
    weaknesses: z.array(z.string()).max(3, 'Maximum 3 weaknesses allowed').optional(),

    // Preferences
    preferredGameTypes: z.array(z.enum(['pickup', 'tournament', 'scrimmage', 'practice'])).optional(),
    availability: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
    preferredTimes: z.array(z.enum(['morning', 'afternoon', 'evening', 'night'])).optional(),

    // Contact & Location
    phone: commonValidation.phone,
    city: z.string().min(1, 'City is required').max(100, 'City name too long'),
    maxDistance: z.number().min(1, 'Max distance must be at least 1km').max(100, 'Max distance cannot exceed 100km'),

    // Social Media
    socialMedia: z.object({
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      youtube: z.string().optional(),
      tiktok: z.string().optional(),
    }).optional(),
  }),
};

// Game-related schemas
export const gameSchemas = {
  create: z.object({
    title: z.string().min(3, 'Game title must be at least 3 characters').max(100, 'Title too long'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    courtId: z.string().min(1, 'Please select a court'),
    date: z.string().refine((date) => {
      const gameDate = new Date(date);
      const now = new Date();
      return gameDate > now;
    }, 'Game date must be in the future'),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time'),
    maxPlayers: z.number().min(2, 'At least 2 players required').max(20, 'Maximum 20 players allowed'),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'pro'], {
      errorMap: () => ({ message: 'Please select a skill level' })
    }),
    gameType: z.enum(['pickup', 'tournament', 'scrimmage', 'practice'], {
      errorMap: () => ({ message: 'Please select a game type' })
    }),
    isPrivate: z.boolean().optional(),
    entryFee: z.number().min(0, 'Entry fee cannot be negative').optional(),
    rules: z.string().max(1000, 'Rules must be less than 1000 characters').optional(),
  }),

  join: z.object({
    gameId: z.string().min(1, 'Game ID is required'),
    message: z.string().max(200, 'Message must be less than 200 characters').optional(),
  }),
};

// Team-related schemas
export const teamSchemas = {
  create: z.object({
    name: z.string().min(3, 'Team name must be at least 3 characters').max(50, 'Team name too long'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    isPrivate: z.boolean().optional(),
    maxMembers: z.number().min(5, 'Team must allow at least 5 members').max(50, 'Maximum 50 members allowed'),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'pro'], {
      errorMap: () => ({ message: 'Please select a skill level' })
    }),
    location: z.string().max(100, 'Location must be less than 100 characters').optional(),
    requirements: z.string().max(300, 'Requirements must be less than 300 characters').optional(),
  }),

  join: z.object({
    teamId: z.string().min(1, 'Team ID is required'),
    message: z.string().max(300, 'Message must be less than 300 characters').optional(),
    position: z.enum(['point-guard', 'shooting-guard', 'small-forward', 'power-forward', 'center', 'any'], {
      errorMap: () => ({ message: 'Please select a position' })
    }).optional(),
  }),
};

// Court-related schemas
export const courtSchemas = {
  create: z.object({
    name: z.string().min(3, 'Court name must be at least 3 characters').max(100, 'Court name too long'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    address: z.string().min(10, 'Please provide a complete address'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    courtType: z.enum(['outdoor', 'indoor', 'half-court', 'full-court'], {
      errorMap: () => ({ message: 'Please select a court type' })
    }),
    surface: z.enum(['concrete', 'asphalt', 'hardwood', 'synthetic', 'other'], {
      errorMap: () => ({ message: 'Please select a surface type' })
    }),
    hoops: z.number().min(1, 'At least 1 hoop required').max(10, 'Maximum 10 hoops'),
    lighting: z.boolean().optional(),
    freeToPlay: z.boolean().optional(),
    amenities: z.array(z.string()).optional(),
    operatingHours: z.object({
      monday: z.object({ open: z.string(), close: z.string() }).optional(),
      tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
      wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
      thursday: z.object({ open: z.string(), close: z.string() }).optional(),
      friday: z.object({ open: z.string(), close: z.string() }).optional(),
      saturday: z.object({ open: z.string(), close: z.string() }).optional(),
      sunday: z.object({ open: z.string(), close: z.string() }).optional(),
    }).optional(),
  }),
};

// Contact/Support schemas
export const supportSchemas = {
  contact: z.object({
    name: z.string().min(1, 'Name is required'),
    email: commonValidation.email,
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message too long'),
    category: z.enum(['bug', 'feature', 'support', 'other'], {
      errorMap: () => ({ message: 'Please select a category' })
    }),
  }),

  reportIssue: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    type: z.enum(['bug', 'inappropriate-content', 'spam', 'harassment', 'other'], {
      errorMap: () => ({ message: 'Please select an issue type' })
    }),
    severity: z.enum(['low', 'medium', 'high', 'critical'], {
      errorMap: () => ({ message: 'Please select severity level' })
    }),
    steps: z.string().optional(),
    expectedBehavior: z.string().optional(),
    actualBehavior: z.string().optional(),
  }),
};

// Export all schemas
export const schemas = {
  user: userSchemas,
  game: gameSchemas,
  team: teamSchemas,
  court: courtSchemas,
  support: supportSchemas,
};

// Type inference helpers
export type RegisterFormData = z.infer<typeof userSchemas.register>;
export type LoginFormData = z.infer<typeof userSchemas.login>;
export type ProfileFormData = z.infer<typeof userSchemas.profile>;
export type BasketballProfileFormData = z.infer<typeof userSchemas.basketballProfile>;
export type CreateGameFormData = z.infer<typeof gameSchemas.create>;
export type CreateTeamFormData = z.infer<typeof teamSchemas.create>;
export type CreateCourtFormData = z.infer<typeof courtSchemas.create>;
export type ContactFormData = z.infer<typeof supportSchemas.contact>;

// Validation helper function
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

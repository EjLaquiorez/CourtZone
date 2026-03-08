import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format a date and time to a readable string
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format time only
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      const suffix = count === 1 ? '' : 's';
      const prefix = diffInSeconds < 0 ? '' : 'in ';
      const postfix = diffInSeconds < 0 ? ' ago' : '';
      return `${prefix}${count} ${interval.label}${suffix}${postfix}`;
    }
  }

  return 'just now';
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance with appropriate units
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return `${Math.round(miles * 5280)} ft`;
  } else if (miles < 1) {
    return `${(miles * 5280).toFixed(0)} ft`;
  } else {
    return `${miles.toFixed(1)} mi`;
  }
}

/**
 * Calculate win percentage
 */
export function calculateWinPercentage(wins: number, totalGames: number): number {
  if (totalGames === 0) return 0;
  return Math.round((wins / totalGames) * 100);
}

/**
 * Get skill level label
 */
export function getSkillLevelLabel(level: number): string {
  const labels = [
    '', 'Beginner', 'Novice', 'Recreational', 'Intermediate', 'Intermediate+',
    'Advanced', 'Competitive', 'Elite', 'Professional', 'All-Star'
  ];
  return labels[level] || 'Unknown';
}

/**
 * Get position full name
 */
export function getPositionName(position: string): string {
  const positions: Record<string, string> = {
    'PG': 'Point Guard',
    'SG': 'Shooting Guard',
    'SF': 'Small Forward',
    'PF': 'Power Forward',
    'C': 'Center'
  };
  return positions[position] || position;
}

/**
 * Generate a random basketball team name
 */
export function generateTeamName(): string {
  const adjectives = [
    'Thunder', 'Lightning', 'Fire', 'Storm', 'Blazing', 'Elite', 'Supreme',
    'Mighty', 'Golden', 'Silver', 'Diamond', 'Steel', 'Iron', 'Rapid',
    'Swift', 'Fierce', 'Bold', 'Brave', 'Strong', 'Power'
  ];

  const nouns = [
    'Ballers', 'Hoops', 'Dunkers', 'Shooters', 'Dribblers', 'Slammers',
    'Legends', 'Champions', 'Warriors', 'Knights', 'Eagles', 'Hawks',
    'Lions', 'Tigers', 'Bears', 'Wolves', 'Sharks', 'Dragons', 'Phoenix',
    'Titans', 'Giants', 'Rockets', 'Comets', 'Stars', 'Meteors'
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adjective} ${noun}`;
}

/**
 * Generate a unique invitation code
 */
export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Format large numbers (e.g., 1000 -> 1K)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Get basketball emoji based on context
 */
export function getBasketballEmoji(context: 'win' | 'loss' | 'game' | 'team'): string {
  const emojis = {
    win: '🏆',
    loss: '😔',
    game: '🏀',
    team: '👥'
  };
  return emojis[context] || '🏀';
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if user is online (simple implementation)
 */
export function isUserOnline(): boolean {
  return navigator.onLine;
}

/**
 * Get device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * Centralized badge definitions from ACHIEVEMENT TierS spec.
 * Used by the achievement engine and frontend for consistent display.
 */

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type BadgeCategory =
  | 'reliability_foundation'
  | 'punctuality'
  | 'community_builder'
  | 'consistency_loyalty'
  | 'social_culture'
  | 'rare_legendary'
  | 'onboarding';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  category: BadgeCategory;
  icon: string;
  points: number;
  perkSummary: string;
  /** Phase 1 = MVP (existing data), 2 = needs check-in, 3 = needs social/feedback */
  phase: 1 | 2 | 3;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Tier 1: Reliability Foundation
  {
    id: 'first-commitment',
    name: 'First Commitment',
    description: 'Show up to your first booked game',
    tier: 'bronze',
    category: 'reliability_foundation',
    icon: '🎯',
    points: 10,
    perkSummary: 'Profile activated',
    phase: 1
  },
  {
    id: 'solid',
    name: 'Solid',
    description: '5 games played, 100% show-up rate',
    tier: 'bronze',
    category: 'reliability_foundation',
    icon: '🧱',
    points: 15,
    perkSummary: '"Reliable" badge on profile',
    phase: 1
  },
  {
    id: 'rock-solid',
    name: 'Rock Solid',
    description: '10 games, 100% show-up rate',
    tier: 'silver',
    category: 'reliability_foundation',
    icon: '🗿',
    points: 25,
    perkSummary: 'Priority on waitlists',
    phase: 1
  },
  {
    id: 'unbreakable',
    name: 'Unbreakable',
    description: '25 games, 100% show-up rate',
    tier: 'gold',
    category: 'reliability_foundation',
    icon: '💎',
    points: 40,
    perkSummary: '"Verified Reliable" status; can host paid games',
    phase: 1
  },
  {
    id: 'iron-man',
    name: 'Iron Man',
    description: '50 games, 100% show-up rate',
    tier: 'gold',
    category: 'reliability_foundation',
    icon: '🏆',
    points: 50,
    perkSummary: 'Legendary status; exclusive "Iron Man" games access',
    phase: 1
  },
  {
    id: 'the-closer',
    name: 'The Closer',
    description: '10 games where you were the last player needed to confirm',
    tier: 'silver',
    category: 'reliability_foundation',
    icon: '🔒',
    points: 30,
    perkSummary: 'Early access to "forming" games',
    phase: 2
  },
  // Tier 2: Punctuality Mastery
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Check in 15+ min early for 5 games',
    tier: 'bronze',
    category: 'punctuality',
    icon: '🐦',
    points: 15,
    perkSummary: '"Early" tag on RSVPs',
    phase: 2
  },
  {
    id: 'set-the-tone',
    name: 'Set the Tone',
    description: 'Check in first at 10 different games',
    tier: 'silver',
    category: 'punctuality',
    icon: '⏰',
    points: 25,
    perkSummary: 'Host can assign you as "co-captain"',
    phase: 2
  },
  {
    id: 'clockwork',
    name: 'Clockwork',
    description: '20 games, 100% on-time rate',
    tier: 'gold',
    category: 'punctuality',
    icon: '⚙️',
    points: 40,
    perkSummary: 'Unlock "guaranteed on-time" filter for hosts',
    phase: 2
  },
  {
    id: 'the-standard',
    name: 'The Standard',
    description: '50 games, 95%+ on-time rate',
    tier: 'gold',
    category: 'punctuality',
    icon: '🥇',
    points: 50,
    perkSummary: 'Profile badge; hosts can see your punctuality history',
    phase: 2
  },
  // Tier 3: Community Builder
  {
    id: 'host',
    name: 'Host',
    description: 'Create and complete your first game',
    tier: 'bronze',
    category: 'community_builder',
    icon: '🏠',
    points: 10,
    perkSummary: 'Can now create public games',
    phase: 1
  },
  {
    id: 'regular-host',
    name: 'Regular',
    description: 'Host 10 games, 80%+ completion rate',
    tier: 'silver',
    category: 'community_builder',
    icon: '🏡',
    points: 30,
    perkSummary: '"Trusted Host" badge; games get promoted',
    phase: 1
  },
  {
    id: 'mayor',
    name: 'Mayor',
    description: 'Host 25 games at the same court',
    tier: 'gold',
    category: 'community_builder',
    icon: '🎩',
    points: 50,
    perkSummary: 'Court "Mayor" title; edit court info',
    phase: 1
  },
  {
    id: 'the-connector',
    name: 'The Connector',
    description: '10 games where you brought a new player who showed up',
    tier: 'silver',
    category: 'community_builder',
    icon: '🔗',
    points: 35,
    perkSummary: '"Recruiter" status; bonus reliability points',
    phase: 3
  },
  {
    id: 'fill-in-hero',
    name: 'Fill-In Hero',
    description: 'Join 10 games from waitlist within 30 min of start',
    tier: 'gold',
    category: 'community_builder',
    icon: '🦸',
    points: 45,
    perkSummary: '"Emergency" badge; instant waitlist priority',
    phase: 2
  },
  {
    id: 'the-reviver',
    name: 'The Reviver',
    description: 'Save 5 games from cancellation by joining last-minute',
    tier: 'gold',
    category: 'community_builder',
    icon: '⚡',
    points: 50,
    perkSummary: '"Clutch" status; hosts can ping you directly',
    phase: 2
  },
  // Tier 4: Consistency & Loyalty
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Play 4+ weeks in a row',
    tier: 'bronze',
    category: 'consistency_loyalty',
    icon: '📅',
    points: 20,
    perkSummary: '"Active" boost in search results',
    phase: 1
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: 'Play 15+ days in a month',
    tier: 'silver',
    category: 'consistency_loyalty',
    icon: '🔥',
    points: 35,
    perkSummary: 'Streak tracker on profile',
    phase: 1
  },
  {
    id: 'the-regular-slot',
    name: 'The Regular',
    description: 'Same game slot (e.g., Tuesdays 6pm) 10 times',
    tier: 'silver',
    category: 'consistency_loyalty',
    icon: '🔄',
    points: 30,
    perkSummary: '"Regular" tag; auto-RSVP option',
    phase: 1
  },
  {
    id: 'court-legend',
    name: 'Court Legend',
    description: '50 games at a single court',
    tier: 'gold',
    category: 'consistency_loyalty',
    icon: '👑',
    points: 60,
    perkSummary: 'Permanent court recognition; name on "Wall of Fame"',
    phase: 1
  },
  {
    id: 'court-explorer',
    name: 'Court Explorer',
    description: 'Play at 3+ different courts',
    tier: 'bronze',
    category: 'consistency_loyalty',
    icon: '🗺️',
    points: 15,
    perkSummary: 'Explore the city',
    phase: 1
  },
  {
    id: 'city-legend',
    name: 'City Legend',
    description: 'Play at 10+ different courts across the city',
    tier: 'platinum',
    category: 'consistency_loyalty',
    icon: '🌆',
    points: 70,
    perkSummary: 'City-wide recognition',
    phase: 1
  },
  {
    id: 'all-weather',
    name: 'All-Weather',
    description: 'Play 10 outdoor games despite suboptimal weather',
    tier: 'silver',
    category: 'consistency_loyalty',
    icon: '🌧️',
    points: 30,
    perkSummary: '"Tough" badge; outdoor hosts can invite first',
    phase: 2
  },
  // Tier 5: Social & Culture
  {
    id: 'good-run',
    name: 'Good Run',
    description: 'Receive "Would play with again" from 10 different players',
    tier: 'silver',
    category: 'social_culture',
    icon: '🤝',
    points: 40,
    perkSummary: '"Positive Vibes" badge',
    phase: 3
  },
  {
    id: 'the-peacemaker',
    name: 'The Peacemaker',
    description: '5 games where you helped resolve disputes (host-reported)',
    tier: 'gold',
    category: 'social_culture',
    icon: '☮️',
    points: 50,
    perkSummary: 'Mediator status for tense games',
    phase: 3
  },
  {
    id: 'rookie-mentor',
    name: 'Rookie Mentor',
    description: 'Play 10 games with players on their 1st-3rd game',
    tier: 'gold',
    category: 'social_culture',
    icon: '🎓',
    points: 45,
    perkSummary: '"Veteran" badge; new player games priority',
    phase: 3
  },
  {
    id: 'squad-leader',
    name: 'Squad Leader',
    description: '10 games where 3+ players joined because of you',
    tier: 'platinum',
    category: 'social_culture',
    icon: '🚩',
    points: 60,
    perkSummary: 'Can create "Squad" private games',
    phase: 3
  },
  // Tier 6: Rare & Legendary
  {
    id: 'perfect-season',
    name: 'Perfect Season',
    description: '20+ games, 100% show-up, 100% on-time in 90 days',
    tier: 'platinum',
    category: 'rare_legendary',
    icon: '🌟',
    points: 80,
    perkSummary: 'Annual recognition; exclusive merch eligibility',
    phase: 2
  },
  {
    id: 'the-foundation',
    name: 'The Foundation',
    description: '100 games played, 95%+ reliability',
    tier: 'platinum',
    category: 'rare_legendary',
    icon: '🏛️',
    points: 100,
    perkSummary: 'Lifetime "Founding Member" status',
    phase: 1
  },
  {
    id: 'ghostbuster',
    name: 'Ghostbuster',
    description: 'Never no-show in 50+ games',
    tier: 'gold',
    category: 'rare_legendary',
    icon: '👻',
    points: 55,
    perkSummary: '"Ghost-Free" guarantee to hosts',
    phase: 1
  },
  {
    id: 'the-institution',
    name: 'The Institution',
    description: '200 games at same location over 2+ years',
    tier: 'platinum',
    category: 'rare_legendary',
    icon: '🗽',
    points: 120,
    perkSummary: 'Court naming rights consideration; permanent legacy badge',
    phase: 1
  },
  // New User Onboarding (Day 0–7 + referrals)
  {
    id: 'rookie-card',
    name: 'Rookie Card',
    description: 'Complete your profile (username, position, skill level)',
    tier: 'bronze',
    category: 'onboarding',
    icon: '🆔',
    points: 5,
    perkSummary: 'Profile activated; visible in player search',
    phase: 1
  },
  {
    id: 'local-scout',
    name: 'Local Scout',
    description: 'Add your first court to the map',
    tier: 'bronze',
    category: 'onboarding',
    icon: '📍',
    points: 10,
    perkSummary: 'Help others find courts',
    phase: 1
  },
  {
    id: 'first-step',
    name: 'First Step',
    description: 'Book or join your first game',
    tier: 'bronze',
    category: 'onboarding',
    icon: '👟',
    points: 10,
    perkSummary: 'You\'re in the game',
    phase: 1
  },
  {
    id: 'verified-hoop',
    name: 'Verified Hoop',
    description: 'Complete your first game (show up and play)',
    tier: 'silver',
    category: 'onboarding',
    icon: '✅',
    points: 20,
    perkSummary: 'Verified player badge; hosts can see you showed up',
    phase: 1
  },
  {
    id: 'the-invite',
    name: 'The Invite',
    description: 'Refer 1 friend who completes profile and plays 1 game',
    tier: 'silver',
    category: 'onboarding',
    icon: '📨',
    points: 15,
    perkSummary: '+5 reliability points; The Invite badge',
    phase: 1
  },
  {
    id: 'squad-up',
    name: 'Squad Up',
    description: '3 successful referrals (profile + 1 game each)',
    tier: 'gold',
    category: 'onboarding',
    icon: '👥',
    points: 30,
    perkSummary: 'Group RSVP feature; Squad Up badge',
    phase: 1
  },
  {
    id: 'the-movement',
    name: 'The Movement',
    description: '5 successful referrals',
    tier: 'gold',
    category: 'onboarding',
    icon: '🌊',
    points: 50,
    perkSummary: 'Ambassador title; host priority; exclusive perks',
    phase: 1
  },
  {
    id: 'handshake',
    name: 'Handshake',
    description: 'Connect with 3+ players (add friends or play together)',
    tier: 'bronze',
    category: 'onboarding',
    icon: '🤝',
    points: 15,
    perkSummary: 'Expand your circle',
    phase: 1
  },
  {
    id: 'circle-game',
    name: 'Circle Game',
    description: 'Play 5+ games with your network (same players)',
    tier: 'silver',
    category: 'onboarding',
    icon: '⭕',
    points: 25,
    perkSummary: 'Regular crew badge',
    phase: 1
  }
];

/** Badge definitions by id for quick lookup */
export const BADGES_BY_ID = Object.fromEntries(
  BADGE_DEFINITIONS.map((b) => [b.id, b])
);

/** Categories for display (label and order) */
export const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  reliability_foundation: 'Reliability Foundation',
  punctuality: 'Punctuality Mastery',
  community_builder: 'Community Builder',
  consistency_loyalty: 'Consistency & Loyalty',
  social_culture: 'Social & Culture',
  rare_legendary: 'Rare & Legendary',
  onboarding: 'New User Onboarding'
};

/** Onboarding badge ids (computed from profile, courts, games, referrals) */
export const ONBOARDING_BADGE_IDS = new Set([
  'rookie-card',
  'local-scout',
  'first-step',
  'verified-hoop',
  'the-invite',
  'squad-up',
  'the-movement',
  'handshake',
  'circle-game'
]);

/** Only Phase 1 badges are computed in MVP */
export const PHASE_1_BADGE_IDS = new Set(
  BADGE_DEFINITIONS.filter((b) => b.phase === 1).map((b) => b.id)
);

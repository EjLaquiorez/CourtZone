/**
 * Achievement engine: computes unlocked badges and progress from user stats and history.
 * Phase 1 (MVP) uses existing reliability counters and participation history only.
 */

import {
  BADGE_DEFINITIONS,
  PHASE_1_BADGE_IDS,
  type BadgeCategory,
  type BadgeTier
} from '@/config/achievements';

export interface UserReliabilityCounters {
  gamesPlayed: number;
  gamesCompleted: number;
  gamesWithNoShowIssues: number;
  gamesHosted: number;
  gamesHostedCompleted: number;
  gamesHostedWithNoShowIssues: number;
}

export interface CompletedGameEntry {
  gameId: string;
  courtId: string;
  scheduledAt: Date;
}

export interface ParticipationHistory {
  /** Completed games as player with court and date */
  completedAsPlayer: CompletedGameEntry[];
  /** Completed games as organizer (host) with court and date */
  completedAsHost: CompletedGameEntry[];
}

/** New-user onboarding: profile, courts, first game, referrals, network */
export interface OnboardingContext {
  profileComplete: boolean;
  courtsCreatedCount: number;
  /** Successful referrals: referred user completed profile + 1 game */
  referralCount: number;
  /** Distinct co-players in completed games (for Handshake / Circle Game) */
  distinctCoPlayersCount: number;
}

export interface AchievementWithMeta {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  category: BadgeCategory;
  icon: string;
  points: number;
  perkSummary: string;
  isUnlocked: boolean;
  progress?: { current: number; target: number };
}

/** Show-up rate: 1 - (noShowIssues / completed). 1.0 = perfect. */
function getShowUpRate(c: UserReliabilityCounters): number | null {
  if (c.gamesCompleted <= 0) return null;
  return 1 - c.gamesWithNoShowIssues / c.gamesCompleted;
}

/** Host completion rate: completed / hosted */
function getHostCompletionRate(c: UserReliabilityCounters): number | null {
  if (c.gamesHosted <= 0) return null;
  return c.gamesHostedCompleted / c.gamesHosted;
}

/** Distinct calendar weeks (ISO week) that have at least one completed game */
function getWeeksWithGames(entries: CompletedGameEntry[]): number[] {
  const weeks = new Set<number>();
  for (const e of entries) {
    const d = new Date(e.scheduledAt);
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.floor(
      (d.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    weeks.add(d.getFullYear() * 1000 + weekNum);
  }
  return Array.from(weeks).sort((a, b) => a - b);
}

/** Longest streak of consecutive weeks (each week has at least one game) */
function getLongestWeekStreak(weeks: number[]): number {
  if (weeks.length === 0) return 0;
  let max = 1;
  let current = 1;
  for (let i = 1; i < weeks.length; i++) {
    if (weeks[i] === weeks[i - 1] + 1) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 1;
    }
  }
  return max;
}

/** Distinct days per month */
function getDaysPerMonth(entries: CompletedGameEntry[]): Map<string, number> {
  const monthToDays = new Map<string, Set<number>>();
  for (const e of entries) {
    const d = new Date(e.scheduledAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthToDays.has(key)) monthToDays.set(key, new Set());
    monthToDays.get(key)!.add(d.getDate());
  }
  const daysPerMonth = new Map<string, number>();
  monthToDays.forEach((days, key) => daysPerMonth.set(key, days.size));
  return daysPerMonth;
}

/** Slot = weekday + time bucket. Count completed games per slot. */
function getSlotCounts(entries: CompletedGameEntry[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const e of entries) {
    const d = new Date(e.scheduledAt);
    const weekday = d.getDay();
    const hours = d.getHours();
    const bucket = hours < 12 ? 'am' : hours < 17 ? 'pm' : 'eve';
    const slot = `${weekday}-${bucket}`;
    counts.set(slot, (counts.get(slot) ?? 0) + 1);
  }
  return counts;
}

/** Games per court (as player) with first/last date */
function getPlayerGamesByCourt(
  entries: CompletedGameEntry[]
): Map<string, { count: number; first: Date; last: Date }> {
  const byCourt = new Map<string, { count: number; first: Date; last: Date }>();
  for (const e of entries) {
    const existing = byCourt.get(e.courtId);
    const d = new Date(e.scheduledAt);
    if (!existing) {
      byCourt.set(e.courtId, { count: 1, first: d, last: d });
    } else {
      existing.count++;
      if (d < existing.first) existing.first = d;
      if (d > existing.last) existing.last = d;
    }
  }
  return byCourt;
}

/** Games per court as host */
function getHostGamesByCourt(entries: CompletedGameEntry[]): Map<string, number> {
  const byCourt = new Map<string, number>();
  for (const e of entries) {
    byCourt.set(e.courtId, (byCourt.get(e.courtId) ?? 0) + 1);
  }
  return byCourt;
}

/** Two years in ms */
const TWO_YEARS_MS = 2 * 365.25 * 24 * 60 * 60 * 1000;

/**
 * Compute all Phase 1 achievements and their unlock state + progress.
 * Returns one entry per Phase 1 badge (so UI can show full Trophy Room).
 */
export function computeAchievements(
  counters: UserReliabilityCounters,
  history: ParticipationHistory,
  onboarding: OnboardingContext
): AchievementWithMeta[] {
  const showUpRate = getShowUpRate(counters);
  const hostCompletionRate = getHostCompletionRate(counters);
  const playerEntries = history.completedAsPlayer;
  const hostEntries = history.completedAsHost;

  const gamesCompleted = counters.gamesCompleted;
  const gamesPlayed = counters.gamesPlayed;
  const noShowCount = counters.gamesWithNoShowIssues;

  const playerByCourt = getPlayerGamesByCourt(playerEntries);
  const hostByCourt = getHostGamesByCourt(hostEntries);
  const courtIds = new Set(playerEntries.map((e) => e.courtId));
  const uniqueCourtsCount = courtIds.size;

  const weeks = getWeeksWithGames(playerEntries);
  const longestWeekStreak = getLongestWeekStreak(weeks);
  const daysPerMonth = getDaysPerMonth(playerEntries);
  const maxDaysInMonth = Math.max(0, ...daysPerMonth.values());
  const slotCounts = getSlotCounts(playerEntries);
  const maxSlotCount = Math.max(0, ...slotCounts.values());

  const result: AchievementWithMeta[] = [];

  for (const def of BADGE_DEFINITIONS) {
    if (!PHASE_1_BADGE_IDS.has(def.id)) continue;

    let isUnlocked = false;
    let progress: { current: number; target: number } | undefined;

    switch (def.id) {
      case 'first-commitment':
        isUnlocked = gamesCompleted >= 1;
        if (!isUnlocked) progress = { current: gamesCompleted, target: 1 };
        break;

      case 'solid':
        isUnlocked = gamesCompleted >= 5 && showUpRate === 1.0;
        if (!isUnlocked) {
          const current = showUpRate === 1.0 ? gamesCompleted : 0;
          progress = { current: Math.min(current, 5), target: 5 };
        }
        break;

      case 'rock-solid':
        isUnlocked = gamesCompleted >= 10 && showUpRate === 1.0;
        if (!isUnlocked) {
          const current = showUpRate === 1.0 ? gamesCompleted : 0;
          progress = { current: Math.min(current, 10), target: 10 };
        }
        break;

      case 'unbreakable':
        isUnlocked = gamesCompleted >= 25 && showUpRate === 1.0;
        if (!isUnlocked) {
          const current = showUpRate === 1.0 ? gamesCompleted : 0;
          progress = { current: Math.min(current, 25), target: 25 };
        }
        break;

      case 'iron-man':
        isUnlocked = gamesCompleted >= 50 && showUpRate === 1.0;
        if (!isUnlocked) {
          const current = showUpRate === 1.0 ? gamesCompleted : 0;
          progress = { current: Math.min(current, 50), target: 50 };
        }
        break;

      case 'ghostbuster':
        isUnlocked = gamesCompleted >= 50 && noShowCount === 0;
        if (!isUnlocked) {
          const current = noShowCount === 0 ? gamesCompleted : 0;
          progress = { current: Math.min(current, 50), target: 50 };
        }
        break;

      case 'the-foundation':
        isUnlocked = gamesCompleted >= 100 && (showUpRate ?? 0) >= 0.95;
        if (!isUnlocked) {
          const current = (showUpRate ?? 0) >= 0.95 ? gamesCompleted : 0;
          progress = { current: Math.min(current, 100), target: 100 };
        }
        break;

      case 'host':
        isUnlocked = counters.gamesHostedCompleted >= 1;
        if (!isUnlocked)
          progress = { current: counters.gamesHostedCompleted, target: 1 };
        break;

      case 'regular-host':
        isUnlocked =
          counters.gamesHosted >= 10 && (hostCompletionRate ?? 0) >= 0.8;
        if (!isUnlocked) {
          const current =
            (hostCompletionRate ?? 0) >= 0.8 ? counters.gamesHosted : 0;
          progress = { current: Math.min(current, 10), target: 10 };
        }
        break;

      case 'mayor':
        const mayorCourtCount = Math.max(0, ...hostByCourt.values());
        isUnlocked = mayorCourtCount >= 25;
        if (!isUnlocked) progress = { current: mayorCourtCount, target: 25 };
        break;

      case 'court-explorer':
        isUnlocked = uniqueCourtsCount >= 3;
        if (!isUnlocked) progress = { current: uniqueCourtsCount, target: 3 };
        break;

      case 'city-legend':
        isUnlocked = uniqueCourtsCount >= 10;
        if (!isUnlocked) progress = { current: uniqueCourtsCount, target: 10 };
        break;

      case 'court-legend':
        const courtLegendCount = Math.max(
          0,
          ...Array.from(playerByCourt.values()).map((v) => v.count)
        );
        isUnlocked = courtLegendCount >= 50;
        if (!isUnlocked) progress = { current: courtLegendCount, target: 50 };
        break;

      case 'the-institution':
        let institutionUnlocked = false;
        for (const v of playerByCourt.values()) {
          if (
            v.count >= 200 &&
            v.last.getTime() - v.first.getTime() >= TWO_YEARS_MS
          ) {
            institutionUnlocked = true;
            break;
          }
        }
        isUnlocked = institutionUnlocked;
        if (!isUnlocked) {
          let best = 0;
          for (const v of playerByCourt.values()) {
            if (v.count >= 200) {
              const span = v.last.getTime() - v.first.getTime();
              if (span >= TWO_YEARS_MS) best = 200;
              else best = Math.max(best, v.count);
            } else {
              best = Math.max(best, v.count);
            }
          }
          progress = { current: best, target: 200 };
        }
        break;

      case 'week-warrior':
        isUnlocked = longestWeekStreak >= 4;
        if (!isUnlocked)
          progress = { current: longestWeekStreak, target: 4 };
        break;

      case 'month-master':
        isUnlocked = maxDaysInMonth >= 15;
        if (!isUnlocked) progress = { current: maxDaysInMonth, target: 15 };
        break;

      case 'the-regular-slot':
        isUnlocked = maxSlotCount >= 10;
        if (!isUnlocked) progress = { current: maxSlotCount, target: 10 };
        break;

      // Onboarding badges
      case 'rookie-card':
        isUnlocked = onboarding.profileComplete;
        if (!isUnlocked)
          progress = { current: onboarding.profileComplete ? 1 : 0, target: 1 };
        break;

      case 'local-scout':
        isUnlocked = onboarding.courtsCreatedCount >= 1;
        if (!isUnlocked)
          progress = { current: onboarding.courtsCreatedCount, target: 1 };
        break;

      case 'first-step':
        isUnlocked = gamesPlayed >= 1;
        if (!isUnlocked) progress = { current: gamesPlayed, target: 1 };
        break;

      case 'verified-hoop':
        isUnlocked = gamesCompleted >= 1;
        if (!isUnlocked) progress = { current: gamesCompleted, target: 1 };
        break;

      case 'the-invite':
        isUnlocked = onboarding.referralCount >= 1;
        if (!isUnlocked) progress = { current: onboarding.referralCount, target: 1 };
        break;

      case 'squad-up':
        isUnlocked = onboarding.referralCount >= 3;
        if (!isUnlocked) progress = { current: onboarding.referralCount, target: 3 };
        break;

      case 'the-movement':
        isUnlocked = onboarding.referralCount >= 5;
        if (!isUnlocked) progress = { current: onboarding.referralCount, target: 5 };
        break;

      case 'handshake':
        isUnlocked = onboarding.distinctCoPlayersCount >= 3;
        if (!isUnlocked)
          progress = { current: onboarding.distinctCoPlayersCount, target: 3 };
        break;

      case 'circle-game':
        isUnlocked = gamesCompleted >= 5 && onboarding.distinctCoPlayersCount >= 2;
        if (!isUnlocked) {
          const current = Math.min(gamesCompleted, 5);
          progress = { current, target: 5 };
        }
        break;

      default:
        progress = { current: 0, target: 1 };
    }

    result.push({
      id: def.id,
      name: def.name,
      description: def.description,
      tier: def.tier,
      category: def.category,
      icon: def.icon,
      points: def.points,
      perkSummary: def.perkSummary,
      isUnlocked,
      progress
    });
  }

  return result;
}

/**
 * Return top N badges for profile header (unlocked first, then by tier order).
 */
export function getTopBadges(
  achievements: AchievementWithMeta[],
  n: number = 3
): AchievementWithMeta[] {
  const tierOrder: BadgeTier[] = ['platinum', 'gold', 'silver', 'bronze'];
  const byTier = (a: AchievementWithMeta) => tierOrder.indexOf(a.tier);
  const unlocked = achievements.filter((a) => a.isUnlocked);
  const locked = achievements.filter((a) => !a.isUnlocked);
  const sortedUnlocked = [...unlocked].sort(
    (a, b) => byTier(a) - byTier(b) || b.points - a.points
  );
  const sortedLocked = [...locked].sort(
    (a, b) => byTier(a) - byTier(b) || b.points - a.points
  );
  return [...sortedUnlocked, ...sortedLocked].slice(0, n);
}

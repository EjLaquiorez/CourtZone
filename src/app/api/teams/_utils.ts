import { prisma } from '@/lib/db'

type PrismaRole = 'CAPTAIN' | 'CO_CAPTAIN' | 'MEMBER'
export type TeamRole = 'captain' | 'co_captain' | 'member'

export const mapRoleToClient = (role: PrismaRole): TeamRole => {
  if (role === 'CAPTAIN') return 'captain'
  if (role === 'CO_CAPTAIN') return 'co_captain'
  return 'member'
}

export const mapRoleToPrisma = (role: TeamRole): PrismaRole => {
  if (role === 'captain') return 'CAPTAIN'
  if (role === 'co_captain') return 'CO_CAPTAIN'
  return 'MEMBER'
}

export const mapInviteStatusToClient = (
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'DECLINED' | 'CANCELLED'
): 'pending' | 'accepted' | 'expired' | 'declined' | 'cancelled' => {
  return status.toLowerCase() as 'pending' | 'accepted' | 'expired' | 'declined' | 'cancelled'
}

export const mapActivityTypeToClient = (
  type:
    | 'TEAM_CREATED'
    | 'MEMBER_JOINED'
    | 'MEMBER_LEFT'
    | 'MEMBER_REMOVED'
    | 'MEMBER_PROMOTED'
    | 'CAPTAIN_TRANSFERRED'
    | 'GAME_SCHEDULED'
    | 'GAME_RESULT'
    | 'INVITE_SENT'
    | 'INVITE_ACCEPTED'
    | 'TEAM_UPDATED'
): 'team_created' | 'member_joined' | 'member_left' | 'member_removed' | 'member_promoted' | 'captain_transferred' | 'game_scheduled' | 'game_result' | 'invite_sent' | 'invite_accepted' | 'team_updated' => {
  return type.toLowerCase() as
    | 'team_created'
    | 'member_joined'
    | 'member_left'
    | 'member_removed'
    | 'member_promoted'
    | 'captain_transferred'
    | 'game_scheduled'
    | 'game_result'
    | 'invite_sent'
    | 'invite_accepted'
    | 'team_updated'
}

export const createInviteCode = (teamId: string, userId: string) => {
  return `${teamId.slice(-4)}${userId.slice(-4)}${Date.now().toString(36)}`.toUpperCase()
}

export const logTeamActivity = async (params: {
  teamId: string
  userId?: string
  type:
    | 'TEAM_CREATED'
    | 'MEMBER_JOINED'
    | 'MEMBER_LEFT'
    | 'MEMBER_REMOVED'
    | 'MEMBER_PROMOTED'
    | 'CAPTAIN_TRANSFERRED'
    | 'GAME_SCHEDULED'
    | 'GAME_RESULT'
    | 'INVITE_SENT'
    | 'INVITE_ACCEPTED'
    | 'TEAM_UPDATED'
  description: string
}) => {
  await prisma.teamActivity.create({
    data: {
      teamId: params.teamId,
      userId: params.userId ?? null,
      type: params.type,
      description: params.description,
    },
  })
}

-- Team Hub MVP schema extensions

CREATE TYPE "TeamMembershipStatus" AS ENUM ('ACTIVE', 'LEFT', 'REMOVED');
CREATE TYPE "TeamInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'DECLINED', 'CANCELLED');
CREATE TYPE "TeamActivityType" AS ENUM (
  'TEAM_CREATED',
  'MEMBER_JOINED',
  'MEMBER_LEFT',
  'MEMBER_REMOVED',
  'MEMBER_PROMOTED',
  'CAPTAIN_TRANSFERRED',
  'GAME_SCHEDULED',
  'GAME_RESULT',
  'INVITE_SENT',
  'INVITE_ACCEPTED',
  'TEAM_UPDATED'
);

ALTER TABLE "team_members"
ADD COLUMN "status" "TeamMembershipStatus" NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE "games"
ADD COLUMN "hostRatingChange" INTEGER,
ADD COLUMN "opponentRatingChange" INTEGER;

CREATE TABLE "team_invites" (
  "id" TEXT NOT NULL,
  "status" "TeamInviteStatus" NOT NULL DEFAULT 'PENDING',
  "inviteCode" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "teamId" TEXT NOT NULL,
  "invitedUserId" TEXT NOT NULL,
  "invitedById" TEXT NOT NULL,
  CONSTRAINT "team_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "team_invites_inviteCode_key" ON "team_invites"("inviteCode");
CREATE UNIQUE INDEX "team_invites_teamId_invitedUserId_status_key" ON "team_invites"("teamId", "invitedUserId", "status");

ALTER TABLE "team_invites"
ADD CONSTRAINT "team_invites_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_invites"
ADD CONSTRAINT "team_invites_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_invites"
ADD CONSTRAINT "team_invites_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "team_activities" (
  "id" TEXT NOT NULL,
  "type" "TeamActivityType" NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "teamId" TEXT NOT NULL,
  "userId" TEXT,
  CONSTRAINT "team_activities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "team_activities_teamId_createdAt_idx" ON "team_activities"("teamId", "createdAt");

ALTER TABLE "team_activities"
ADD CONSTRAINT "team_activities_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_activities"
ADD CONSTRAINT "team_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

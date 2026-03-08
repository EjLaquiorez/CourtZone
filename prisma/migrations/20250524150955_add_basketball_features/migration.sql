-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('JOINED', 'LEFT', 'KICKED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- AlterTable
ALTER TABLE "courts" ADD COLUMN     "hourlyRate" DOUBLE PRECISION,
ADD COLUMN     "isBookable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "game_participants" ADD COLUMN     "isStarter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leftAt" TIMESTAMP(3),
ADD COLUMN     "position" "Position",
ADD COLUMN     "status" "ParticipantStatus" NOT NULL DEFAULT 'JOINED';

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "finalScore" TEXT,
ADD COLUMN     "gameEndedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "game_waitlist" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "game_waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court_reservations" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "totalCost" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courtId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT,

    CONSTRAINT "court_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court_availability" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courtId" TEXT NOT NULL,

    CONSTRAINT "court_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_stats" (
    "id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "rebounds" INTEGER NOT NULL DEFAULT 0,
    "steals" INTEGER NOT NULL DEFAULT 0,
    "blocks" INTEGER NOT NULL DEFAULT 0,
    "turnovers" INTEGER NOT NULL DEFAULT 0,
    "fouls" INTEGER NOT NULL DEFAULT 0,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "game_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_season_stats" (
    "id" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "totalAssists" INTEGER NOT NULL DEFAULT 0,
    "totalRebounds" INTEGER NOT NULL DEFAULT 0,
    "totalSteals" INTEGER NOT NULL DEFAULT 0,
    "totalBlocks" INTEGER NOT NULL DEFAULT 0,
    "avgPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgAssists" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgRebounds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "winPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "player_season_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_waitlist_gameId_userId_key" ON "game_waitlist"("gameId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "court_reservations_gameId_key" ON "court_reservations"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "game_stats_gameId_userId_key" ON "game_stats"("gameId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "player_season_stats_userId_season_key" ON "player_season_stats"("userId", "season");

-- AddForeignKey
ALTER TABLE "game_waitlist" ADD CONSTRAINT "game_waitlist_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_waitlist" ADD CONSTRAINT "game_waitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_reservations" ADD CONSTRAINT "court_reservations_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_reservations" ADD CONSTRAINT "court_reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_reservations" ADD CONSTRAINT "court_reservations_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_availability" ADD CONSTRAINT "court_availability_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_stats" ADD CONSTRAINT "game_stats_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_stats" ADD CONSTRAINT "game_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_season_stats" ADD CONSTRAINT "player_season_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

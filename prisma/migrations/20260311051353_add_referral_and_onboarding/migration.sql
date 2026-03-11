-- AlterTable
ALTER TABLE "games" ADD COLUMN     "completedById" TEXT,
ADD COLUMN     "hasNoShowIssues" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gamesCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gamesHosted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gamesHostedCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gamesHostedWithNoShowIssues" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gamesWithNoShowIssues" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referrerId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

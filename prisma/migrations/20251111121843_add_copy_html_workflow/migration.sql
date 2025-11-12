-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProjectStatus" ADD VALUE 'COPY_READY';
ALTER TYPE "ProjectStatus" ADD VALUE 'COPY_REVISION';
ALTER TYPE "ProjectStatus" ADD VALUE 'HTML_READY';
ALTER TYPE "ProjectStatus" ADD VALUE 'HTML_REVISION';

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "copy" TEXT,
ADD COLUMN     "copyFeedback" TEXT,
ADD COLUMN     "htmlContent" TEXT,
ADD COLUMN     "htmlFeedback" TEXT;

-- CreateTable
CREATE TABLE "briefings" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "mainServices" TEXT NOT NULL,
    "contactInfo" TEXT NOT NULL,
    "brandColors" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "additionalRequirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "briefings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "briefings_projectId_key" ON "briefings"("projectId");

-- AddForeignKey
ALTER TABLE "briefings" ADD CONSTRAINT "briefings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

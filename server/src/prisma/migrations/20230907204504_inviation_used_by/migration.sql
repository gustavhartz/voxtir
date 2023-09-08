-- AlterTable
ALTER TABLE "ProjectInvitation" ADD COLUMN     "usedById" TEXT;

-- AddForeignKey
ALTER TABLE "ProjectInvitation" ADD CONSTRAINT "ProjectInvitation_usedById_fkey" FOREIGN KEY ("usedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

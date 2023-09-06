-- CreateTable
CREATE TABLE "PinnedProjects" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PinnedProjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PinnedProjects_projectId_userId_idx" ON "PinnedProjects"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PinnedProjects_projectId_userId_key" ON "PinnedProjects"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "PinnedProjects" ADD CONSTRAINT "PinnedProjects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinnedProjects" ADD CONSTRAINT "PinnedProjects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

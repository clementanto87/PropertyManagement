/*
  Warnings:

  - Added the required column `summary` to the `Communication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Communication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Communication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Communication" ADD COLUMN     "followUpDate" TIMESTAMP(3),
ADD COLUMN     "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "summary" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

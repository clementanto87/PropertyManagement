/*
  Warnings:

  - Added the required column `title` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "area" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bathrooms" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "bedrooms" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "image" TEXT,
ADD COLUMN     "parkingSpaces" INTEGER,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'vacant',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'apartment',
ADD COLUMN     "yearBuilt" INTEGER;

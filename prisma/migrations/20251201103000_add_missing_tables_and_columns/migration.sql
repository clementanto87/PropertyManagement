-- CreateTable
CREATE TABLE IF NOT EXISTS "CareTaker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "rateInfo" TEXT,
    "insured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareTaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "HouseOwner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "rateInfo" TEXT,
    "insured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseOwner_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "caretakerId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "houseOwnerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_caretakerId_key" ON "User"("caretakerId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_houseOwnerId_key" ON "User"("houseOwnerId");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_caretakerId_fkey') THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_caretakerId_fkey" FOREIGN KEY ("caretakerId") REFERENCES "CareTaker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_houseOwnerId_fkey') THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_houseOwnerId_fkey" FOREIGN KEY ("houseOwnerId") REFERENCES "HouseOwner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

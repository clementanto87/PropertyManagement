-- _UnitManagers (Unit <-> User)
CREATE TABLE IF NOT EXISTS "_UnitManagers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_UnitManagers_AB_unique" ON "_UnitManagers"("A", "B");
CREATE INDEX IF NOT EXISTS "_UnitManagers_B_index" ON "_UnitManagers"("B");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_UnitManagers_A_fkey') THEN
        ALTER TABLE "_UnitManagers" ADD CONSTRAINT "_UnitManagers_A_fkey" FOREIGN KEY ("A") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_UnitManagers_B_fkey') THEN
        ALTER TABLE "_UnitManagers" ADD CONSTRAINT "_UnitManagers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- _PropertyCareTakers (CareTaker <-> Property)
CREATE TABLE IF NOT EXISTS "_PropertyCareTakers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_PropertyCareTakers_AB_unique" ON "_PropertyCareTakers"("A", "B");
CREATE INDEX IF NOT EXISTS "_PropertyCareTakers_B_index" ON "_PropertyCareTakers"("B");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_PropertyCareTakers_A_fkey') THEN
        ALTER TABLE "_PropertyCareTakers" ADD CONSTRAINT "_PropertyCareTakers_A_fkey" FOREIGN KEY ("A") REFERENCES "CareTaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_PropertyCareTakers_B_fkey') THEN
        ALTER TABLE "_PropertyCareTakers" ADD CONSTRAINT "_PropertyCareTakers_B_fkey" FOREIGN KEY ("B") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- _UnitCareTakers (CareTaker <-> Unit)
CREATE TABLE IF NOT EXISTS "_UnitCareTakers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_UnitCareTakers_AB_unique" ON "_UnitCareTakers"("A", "B");
CREATE INDEX IF NOT EXISTS "_UnitCareTakers_B_index" ON "_UnitCareTakers"("B");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_UnitCareTakers_A_fkey') THEN
        ALTER TABLE "_UnitCareTakers" ADD CONSTRAINT "_UnitCareTakers_A_fkey" FOREIGN KEY ("A") REFERENCES "CareTaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_UnitCareTakers_B_fkey') THEN
        ALTER TABLE "_UnitCareTakers" ADD CONSTRAINT "_UnitCareTakers_B_fkey" FOREIGN KEY ("B") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- _PropertyHouseOwners (HouseOwner <-> Property)
CREATE TABLE IF NOT EXISTS "_PropertyHouseOwners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_PropertyHouseOwners_AB_unique" ON "_PropertyHouseOwners"("A", "B");
CREATE INDEX IF NOT EXISTS "_PropertyHouseOwners_B_index" ON "_PropertyHouseOwners"("B");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_PropertyHouseOwners_A_fkey') THEN
        ALTER TABLE "_PropertyHouseOwners" ADD CONSTRAINT "_PropertyHouseOwners_A_fkey" FOREIGN KEY ("A") REFERENCES "HouseOwner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_PropertyHouseOwners_B_fkey') THEN
        ALTER TABLE "_PropertyHouseOwners" ADD CONSTRAINT "_PropertyHouseOwners_B_fkey" FOREIGN KEY ("B") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- _UnitHouseOwners (HouseOwner <-> Unit)
CREATE TABLE IF NOT EXISTS "_UnitHouseOwners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_UnitHouseOwners_AB_unique" ON "_UnitHouseOwners"("A", "B");
CREATE INDEX IF NOT EXISTS "_UnitHouseOwners_B_index" ON "_UnitHouseOwners"("B");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_UnitHouseOwners_A_fkey') THEN
        ALTER TABLE "_UnitHouseOwners" ADD CONSTRAINT "_UnitHouseOwners_A_fkey" FOREIGN KEY ("A") REFERENCES "HouseOwner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_UnitHouseOwners_B_fkey') THEN
        ALTER TABLE "_UnitHouseOwners" ADD CONSTRAINT "_UnitHouseOwners_B_fkey" FOREIGN KEY ("B") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- _UnitVendors (Unit <-> Vendor)
CREATE TABLE IF NOT EXISTS "_UnitVendors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_UnitVendors_AB_unique" ON "_UnitVendors"("A", "B");
CREATE INDEX IF NOT EXISTS "_UnitVendors_B_index" ON "_UnitVendors"("B");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_UnitVendors_A_fkey') THEN
        ALTER TABLE "_UnitVendors" ADD CONSTRAINT "_UnitVendors_A_fkey" FOREIGN KEY ("A") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_UnitVendors_B_fkey') THEN
        ALTER TABLE "_UnitVendors" ADD CONSTRAINT "_UnitVendors_B_fkey" FOREIGN KEY ("B") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- _PropertyVendors (Property <-> Vendor)
CREATE TABLE IF NOT EXISTS "_PropertyVendors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_PropertyVendors_AB_unique" ON "_PropertyVendors"("A", "B");
CREATE INDEX IF NOT EXISTS "_PropertyVendors_B_index" ON "_PropertyVendors"("B");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_PropertyVendors_A_fkey') THEN
        ALTER TABLE "_PropertyVendors" ADD CONSTRAINT "_PropertyVendors_A_fkey" FOREIGN KEY ("A") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_PropertyVendors_B_fkey') THEN
        ALTER TABLE "_PropertyVendors" ADD CONSTRAINT "_PropertyVendors_B_fkey" FOREIGN KEY ("B") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

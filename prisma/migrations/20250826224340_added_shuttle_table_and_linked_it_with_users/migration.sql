/*
  Warnings:

  - You are about to drop the column `driverId` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `shuttleId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_destinationId_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "driverId",
ADD COLUMN     "shuttleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Shuttle" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleSerialNo" TEXT,
    "vehicleType" TEXT,
    "capacity" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Shuttle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Shuttle" ADD CONSTRAINT "Shuttle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_shuttleId_fkey" FOREIGN KEY ("shuttleId") REFERENCES "public"."Shuttle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

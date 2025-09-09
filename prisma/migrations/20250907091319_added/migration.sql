-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_shuttleId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_shuttleId_fkey" FOREIGN KEY ("shuttleId") REFERENCES "public"."Shuttle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

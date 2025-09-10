-- DropForeignKey
ALTER TABLE "public"."AI_Feature" DROP CONSTRAINT "AI_Feature_bookingId_fkey";

-- AddForeignKey
ALTER TABLE "public"."AI_Feature" ADD CONSTRAINT "AI_Feature_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

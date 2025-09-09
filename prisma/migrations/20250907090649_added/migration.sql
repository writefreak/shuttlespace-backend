-- DropForeignKey
ALTER TABLE "public"."Shuttle" DROP CONSTRAINT "Shuttle_driverId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Shuttle" ADD CONSTRAINT "Shuttle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

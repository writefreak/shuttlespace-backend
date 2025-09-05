-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "paymentStatus" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending';

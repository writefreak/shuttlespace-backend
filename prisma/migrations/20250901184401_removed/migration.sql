/*
  Warnings:

  - You are about to drop the `Images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Images" DROP CONSTRAINT "Images_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "image" TEXT;

-- DropTable
DROP TABLE "public"."Images";

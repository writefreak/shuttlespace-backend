/*
  Warnings:

  - Added the required column `category` to the `Shuttle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Shuttle" ADD COLUMN     "category" TEXT NOT NULL;

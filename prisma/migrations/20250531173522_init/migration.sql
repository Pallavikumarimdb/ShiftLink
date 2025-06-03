/*
  Warnings:

  - Added the required column `country` to the `waitlist_entries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "waitlist_entries" ADD COLUMN     "country" TEXT NOT NULL;

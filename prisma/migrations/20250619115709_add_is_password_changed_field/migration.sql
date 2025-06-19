/*
  Warnings:

  - Added the required column `isPasswordChanged` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin` ADD COLUMN `isPasswordChanged` BOOLEAN NOT NULL;

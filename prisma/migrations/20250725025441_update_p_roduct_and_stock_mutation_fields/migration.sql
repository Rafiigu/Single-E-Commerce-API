/*
  Warnings:

  - Added the required column `imageFileName` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notes` to the `StockMutation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` ADD COLUMN `imageFileName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `stockmutation` ADD COLUMN `notes` VARCHAR(191) NOT NULL;

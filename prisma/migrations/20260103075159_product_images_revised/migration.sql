/*
  Warnings:

  - You are about to drop the column `imageFileName` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `imageFileName`;

-- AlterTable
ALTER TABLE `productimages` MODIFY `original` VARCHAR(191) NULL;

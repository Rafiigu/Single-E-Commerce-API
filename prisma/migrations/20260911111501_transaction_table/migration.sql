/*
  Warnings:

  - You are about to drop the column `trackingNumber` on the `logisticvendor` table. All the data in the column will be lost.
  - You are about to drop the column `logistigVendorId` on the `transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_logistigVendorId_fkey`;

-- DropIndex
DROP INDEX `Transaction_logistigVendorId_fkey` ON `transaction`;

-- AlterTable
ALTER TABLE `logisticvendor` DROP COLUMN `trackingNumber`;

-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `logistigVendorId`,
    ADD COLUMN `logisticVendorId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_logisticVendorId_fkey` FOREIGN KEY (`logisticVendorId`) REFERENCES `LogisticVendor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

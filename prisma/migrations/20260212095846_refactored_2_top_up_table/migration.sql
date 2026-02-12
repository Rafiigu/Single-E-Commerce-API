/*
  Warnings:

  - You are about to drop the column `paymentTermId` on the `topup` table. All the data in the column will be lost.
  - Made the column `paymentAccountId` on table `topup` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `topup` DROP FOREIGN KEY `TopUp_paymentAccountId_fkey`;

-- DropForeignKey
ALTER TABLE `topup` DROP FOREIGN KEY `TopUp_paymentTermId_fkey`;

-- DropIndex
DROP INDEX `TopUp_paymentAccountId_fkey` ON `topup`;

-- DropIndex
DROP INDEX `TopUp_paymentTermId_fkey` ON `topup`;

-- AlterTable
ALTER TABLE `topup` DROP COLUMN `paymentTermId`,
    MODIFY `paymentAccountId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `TopUp` ADD CONSTRAINT `TopUp_paymentAccountId_fkey` FOREIGN KEY (`paymentAccountId`) REFERENCES `PaymentAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

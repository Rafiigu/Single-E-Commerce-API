/*
  Warnings:

  - Made the column `proofOfTransferFileName` on table `topup` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentAccountId` on table `topup` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `topup` DROP FOREIGN KEY `TopUp_paymentAccountId_fkey`;

-- DropIndex
DROP INDEX `TopUp_paymentAccountId_fkey` ON `topup`;

-- AlterTable
ALTER TABLE `topup` MODIFY `proofOfTransferFileName` VARCHAR(191) NOT NULL,
    MODIFY `paymentAccountId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `TopUp` ADD CONSTRAINT `TopUp_paymentAccountId_fkey` FOREIGN KEY (`paymentAccountId`) REFERENCES `PaymentAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

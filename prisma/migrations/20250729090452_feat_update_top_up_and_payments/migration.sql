/*
  Warnings:

  - You are about to drop the column `topUpId` on the `paymentaccount` table. All the data in the column will be lost.
  - You are about to drop the column `topUpId` on the `paymentterm` table. All the data in the column will be lost.
  - Added the required column `paymentAccountId` to the `TopUp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentTermId` to the `TopUp` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `paymentaccount` DROP FOREIGN KEY `PaymentAccount_topUpId_fkey`;

-- DropForeignKey
ALTER TABLE `paymentterm` DROP FOREIGN KEY `PaymentTerm_topUpId_fkey`;

-- DropIndex
DROP INDEX `PaymentAccount_topUpId_fkey` ON `paymentaccount`;

-- DropIndex
DROP INDEX `PaymentTerm_topUpId_fkey` ON `paymentterm`;

-- AlterTable
ALTER TABLE `paymentaccount` DROP COLUMN `topUpId`;

-- AlterTable
ALTER TABLE `paymentterm` DROP COLUMN `topUpId`;

-- AlterTable
ALTER TABLE `topup` ADD COLUMN `paymentAccountId` VARCHAR(191) NOT NULL,
    ADD COLUMN `paymentTermId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `TopUp` ADD CONSTRAINT `TopUp_paymentAccountId_fkey` FOREIGN KEY (`paymentAccountId`) REFERENCES `PaymentAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopUp` ADD CONSTRAINT `TopUp_paymentTermId_fkey` FOREIGN KEY (`paymentTermId`) REFERENCES `PaymentTerm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

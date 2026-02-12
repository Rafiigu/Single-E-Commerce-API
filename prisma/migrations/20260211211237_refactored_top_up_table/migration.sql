-- DropForeignKey
ALTER TABLE `topup` DROP FOREIGN KEY `TopUp_paymentAccountId_fkey`;

-- DropIndex
DROP INDEX `TopUp_paymentAccountId_fkey` ON `topup`;

-- AlterTable
ALTER TABLE `topup` MODIFY `proofOfTransferFileName` VARCHAR(191) NULL,
    MODIFY `paymentAccountId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `TopUp` ADD CONSTRAINT `TopUp_paymentAccountId_fkey` FOREIGN KEY (`paymentAccountId`) REFERENCES `PaymentAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `cancellationReason` VARCHAR(191) NULL,
    ADD COLUMN `deliveredAt` DATETIME(3) NULL,
    ADD COLUMN `logistigVendorId` VARCHAR(191) NULL,
    ADD COLUMN `processedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `LogisticVendor` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_logistigVendorId_fkey` FOREIGN KEY (`logistigVendorId`) REFERENCES `LogisticVendor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

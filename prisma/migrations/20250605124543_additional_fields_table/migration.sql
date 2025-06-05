/*
  Warnings:

  - You are about to drop the column `Details` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `stockmutation` table. All the data in the column will be lost.
  - You are about to drop the column `Quantity` on the `transactiondetails` table. All the data in the column will be lost.
  - You are about to drop the column `Subtotal` on the `transactiondetails` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `StockMutation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `TransactionDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `TransactionDetails` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `topup` DROP FOREIGN KEY `TopUp_adminId_fkey`;

-- DropIndex
DROP INDEX `TopUp_adminId_fkey` ON `topup`;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `Details`,
    ADD COLUMN `categoryId` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `stockmutation` DROP COLUMN `stock`,
    ADD COLUMN `quantity` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `topup` MODIFY `adminId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `status` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `transactiondetails` DROP COLUMN `Quantity`,
    DROP COLUMN `Subtotal`,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `subtotal` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopUp` ADD CONSTRAINT `TopUp_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

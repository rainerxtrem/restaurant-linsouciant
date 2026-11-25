-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'VOUCHER_CHECKER';

-- AlterTable
ALTER TABLE "gift_vouchers" ADD COLUMN "redeemedByName" TEXT;

/*
  Warnings:

  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_variants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Interest" AS ENUM ('temples', 'beaches', 'nature', 'city', 'food', 'culture');

-- CreateEnum
CREATE TYPE "FoodType" AS ENUM ('dish', 'street', 'spot');

-- CreateEnum
CREATE TYPE "PlaceCategory" AS ENUM ('nature', 'business', 'experience');

-- CreateEnum
CREATE TYPE "CostCategory" AS ENUM ('transport', 'stay', 'food', 'activities');

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";

-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_productId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "order_items";

-- DropTable
DROP TABLE "orders";

-- DropTable
DROP TABLE "product_images";

-- DropTable
DROP TABLE "product_variants";

-- DropTable
DROP TABLE "products";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "ProductStatus";

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'S3',
    "uploaderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provinces" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "tagline" JSONB NOT NULL,
    "image" TEXT NOT NULL,
    "interests" "Interest"[],
    "whyGo" JSONB NOT NULL,
    "bestSeasonMonths" JSONB NOT NULL,
    "bestSeasonDetail" JSONB NOT NULL,
    "goodToKnow" JSONB,
    "budgetStay" DECIMAL(10,2) NOT NULL,
    "budgetFood" DECIMAL(10,2) NOT NULL,
    "budgetTransport" DECIMAL(10,2) NOT NULL,
    "budgetActivities" DECIMAL(10,2) NOT NULL,
    "budgetNote" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "province_top_places" (
    "id" TEXT NOT NULL,
    "provinceId" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "image" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "province_top_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "province_transports" (
    "id" TEXT NOT NULL,
    "provinceId" TEXT NOT NULL,
    "mode" JSONB NOT NULL,
    "detail" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "province_transports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upcoming_provinces" (
    "id" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "image" TEXT NOT NULL,
    "interests" "Interest"[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upcoming_provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "khmerName" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL,
    "type" "FoodType" NOT NULL,
    "image" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "whatItIs" JSONB NOT NULL,
    "priceMin" DECIMAL(10,2) NOT NULL,
    "priceMax" DECIMAL(10,2) NOT NULL,
    "priceUnit" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_venues" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "detail" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "food_venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hidden_places" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "khmerName" TEXT,
    "provinceId" TEXT NOT NULL,
    "category" "PlaceCategory" NOT NULL,
    "images" TEXT[],
    "summary" JSONB NOT NULL,
    "special" JSONB NOT NULL,
    "howToReach" JSONB NOT NULL,
    "costMin" DECIMAL(10,2) NOT NULL,
    "costMax" DECIMAL(10,2) NOT NULL,
    "costNote" JSONB NOT NULL,
    "bestTime" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hidden_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_plans" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "provinceId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "people" INTEGER NOT NULL,
    "summary" JSONB NOT NULL,
    "tips" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_plan_costs" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "category" "CostCategory" NOT NULL,
    "label" JSONB NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "budget_plan_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_plan_days" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "items" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "budget_plan_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FoodToProvince" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FoodToProvince_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_key_key" ON "media"("key");

-- CreateIndex
CREATE INDEX "media_uploaderId_idx" ON "media"("uploaderId");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_slug_key" ON "provinces"("slug");

-- CreateIndex
CREATE INDEX "province_top_places_provinceId_idx" ON "province_top_places"("provinceId");

-- CreateIndex
CREATE INDEX "province_transports_provinceId_idx" ON "province_transports"("provinceId");

-- CreateIndex
CREATE UNIQUE INDEX "foods_slug_key" ON "foods"("slug");

-- CreateIndex
CREATE INDEX "foods_type_idx" ON "foods"("type");

-- CreateIndex
CREATE INDEX "food_venues_foodId_idx" ON "food_venues"("foodId");

-- CreateIndex
CREATE UNIQUE INDEX "hidden_places_slug_key" ON "hidden_places"("slug");

-- CreateIndex
CREATE INDEX "hidden_places_provinceId_idx" ON "hidden_places"("provinceId");

-- CreateIndex
CREATE INDEX "hidden_places_category_idx" ON "hidden_places"("category");

-- CreateIndex
CREATE UNIQUE INDEX "budget_plans_slug_key" ON "budget_plans"("slug");

-- CreateIndex
CREATE INDEX "budget_plans_provinceId_idx" ON "budget_plans"("provinceId");

-- CreateIndex
CREATE INDEX "budget_plan_costs_planId_idx" ON "budget_plan_costs"("planId");

-- CreateIndex
CREATE INDEX "budget_plan_days_planId_idx" ON "budget_plan_days"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "contact_messages_createdAt_idx" ON "contact_messages"("createdAt");

-- CreateIndex
CREATE INDEX "_FoodToProvince_B_index" ON "_FoodToProvince"("B");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "province_top_places" ADD CONSTRAINT "province_top_places_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "province_transports" ADD CONSTRAINT "province_transports_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_venues" ADD CONSTRAINT "food_venues_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hidden_places" ADD CONSTRAINT "hidden_places_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_plans" ADD CONSTRAINT "budget_plans_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_plan_costs" ADD CONSTRAINT "budget_plan_costs_planId_fkey" FOREIGN KEY ("planId") REFERENCES "budget_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_plan_days" ADD CONSTRAINT "budget_plan_days_planId_fkey" FOREIGN KEY ("planId") REFERENCES "budget_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FoodToProvince" ADD CONSTRAINT "_FoodToProvince_A_fkey" FOREIGN KEY ("A") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FoodToProvince" ADD CONSTRAINT "_FoodToProvince_B_fkey" FOREIGN KEY ("B") REFERENCES "provinces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

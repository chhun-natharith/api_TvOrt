import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from '../src/app.module';
import { BudgetPlansService } from '../src/budget-plans/budget-plans.service';
import { CreateBudgetPlanDto } from '../src/budget-plans/dto/create-budget-plan.dto';
import { CreateFoodDto } from '../src/foods/dto/create-food.dto';
import { FoodsService } from '../src/foods/foods.service';
import { CreateHiddenPlaceDto } from '../src/hidden-places/dto/create-hidden-place.dto';
import { HiddenPlacesService } from '../src/hidden-places/hidden-places.service';
import { CreateProvinceDto } from '../src/provinces/dto/create-province.dto';
import { ProvincesService } from '../src/provinces/provinces.service';
import { CreateUpcomingProvinceDto } from '../src/upcoming-provinces/dto/create-upcoming-province.dto';
import { UpcomingProvincesService } from '../src/upcoming-provinces/upcoming-provinces.service';

const prisma = new PrismaClient();

/**
 * Permission catalog. Names follow the `resource:action` pattern.
 */
const PERMISSIONS: Array<{ name: string; description: string }> = [
  { name: 'users:read', description: 'List and view user records' },
  { name: 'users:write', description: 'Create and update user records' },
  { name: 'users:delete', description: 'Delete user records' },
  { name: 'users:manage-roles', description: 'Assign or change user roles' },
  {
    name: 'provinces:write',
    description: 'Create and update provinces and "coming soon" provinces',
  },
  {
    name: 'provinces:delete',
    description: 'Delete provinces and "coming soon" provinces',
  },
  { name: 'foods:write', description: 'Create and update foods' },
  { name: 'foods:delete', description: 'Delete foods' },
  { name: 'places:write', description: 'Create and update hidden places' },
  { name: 'places:delete', description: 'Delete hidden places' },
  { name: 'plans:write', description: 'Create and update budget plans' },
  { name: 'plans:delete', description: 'Delete budget plans' },
  { name: 'messages:read', description: 'Read contact form messages' },
  { name: 'messages:write', description: 'Mark contact messages as read' },
  { name: 'messages:delete', description: 'Delete contact messages' },
  { name: 'subscribers:read', description: 'List newsletter subscribers' },
  { name: 'subscribers:delete', description: 'Remove newsletter subscribers' },
  { name: 'media:read', description: 'List and view uploaded media' },
  { name: 'media:write', description: 'Upload media files' },
  { name: 'media:delete', description: 'Delete uploaded media' },
];

/**
 * Role catalog with the permission names assigned to each role.
 */
const ROLES: Array<{
  name: string;
  description: string;
  permissions: string[];
}> = [
  {
    name: 'Admin',
    description: 'Full access to every endpoint and operation',
    permissions: PERMISSIONS.map((p) => p.name),
  },
  {
    name: 'Support',
    description:
      'Edits travel content, uploads media and handles visitor messages',
    permissions: [
      'users:read',
      'users:write',
      'provinces:write',
      'foods:write',
      'places:write',
      'plans:write',
      'messages:read',
      'messages:write',
      'subscribers:read',
      'media:read',
      'media:write',
    ],
  },
  {
    name: 'Customer',
    description: 'Registered account with no admin access',
    permissions: [],
  },
];

interface SeedContent {
  provinces: CreateProvinceDto[];
  upcomingProvinces: CreateUpcomingProvinceDto[];
  foods: CreateFoodDto[];
  hiddenPlaces: CreateHiddenPlaceDto[];
  budgetPlans: CreateBudgetPlanDto[];
}

async function seedAccess(): Promise<void> {
  // 1. Upsert permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }
  console.log(`Seeded ${PERMISSIONS.length} permissions`);

  // 2. Upsert roles + refresh their permission assignments
  for (const roleDef of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description },
      create: { name: roleDef.name, description: roleDef.description },
    });

    // Fetch permission IDs for this role
    const perms = await prisma.permission.findMany({
      where: { name: { in: roleDef.permissions } },
      select: { id: true },
    });

    // Reset then assign — keeps the matrix authoritative on each seed run
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
      skipDuplicates: true,
    });

    console.log(`Seeded role "${role.name}" with ${perms.length} permissions`);
  }

  // 3. Drop permissions that are no longer in the catalog (e.g. the old
  //    inventory ones). Their role assignments cascade away with them.
  const pruned = await prisma.permission.deleteMany({
    where: { name: { notIn: PERMISSIONS.map((p) => p.name) } },
  });
  if (pruned.count > 0) {
    console.log(`Removed ${pruned.count} stale permissions`);
  }

  // 4. Backfill any users missing a role (defaults to Customer)
  const customer = await prisma.role.findUniqueOrThrow({
    where: { name: 'Customer' },
  });
  const backfilled = await prisma.user.updateMany({
    where: { roleId: null },
    data: { roleId: customer.id },
  });
  if (backfilled.count > 0) {
    console.log(`Backfilled ${backfilled.count} users to Customer role`);
  }
}

/**
 * Loads the content the frontend used to hard-code (prisma/seed-data/content.json)
 * through the same services the admin endpoints use. Each resource is only
 * seeded while its table is empty, so re-running never overwrites CMS edits.
 */
async function seedContent(): Promise<void> {
  const content = JSON.parse(
    readFileSync(join(__dirname, 'seed-data', 'content.json'), 'utf8'),
  ) as SeedContent;

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    // Order matters: foods, places and plans reference provinces by slug.
    const steps: Array<{
      label: string;
      isEmpty: () => Promise<boolean>;
      run: () => Promise<void>;
    }> = [
      {
        label: 'provinces',
        isEmpty: async () => (await prisma.province.count()) === 0,
        run: async () => {
          const svc = app.get(ProvincesService);
          for (const dto of content.provinces) await svc.create(dto);
        },
      },
      {
        label: 'upcoming provinces',
        isEmpty: async () => (await prisma.upcomingProvince.count()) === 0,
        run: async () => {
          const svc = app.get(UpcomingProvincesService);
          for (const dto of content.upcomingProvinces) await svc.create(dto);
        },
      },
      {
        label: 'foods',
        isEmpty: async () => (await prisma.food.count()) === 0,
        run: async () => {
          const svc = app.get(FoodsService);
          for (const dto of content.foods) await svc.create(dto);
        },
      },
      {
        label: 'hidden places',
        isEmpty: async () => (await prisma.hiddenPlace.count()) === 0,
        run: async () => {
          const svc = app.get(HiddenPlacesService);
          for (const dto of content.hiddenPlaces) await svc.create(dto);
        },
      },
      {
        label: 'budget plans',
        isEmpty: async () => (await prisma.budgetPlan.count()) === 0,
        run: async () => {
          const svc = app.get(BudgetPlansService);
          for (const dto of content.budgetPlans) await svc.create(dto);
        },
      },
    ];

    for (const step of steps) {
      if (await step.isEmpty()) {
        await step.run();
        console.log(`Seeded ${step.label}`);
      } else {
        console.log(`Skipped ${step.label} (already has data)`);
      }
    }
  } finally {
    await app.close();
  }
}

async function main(): Promise<void> {
  await seedAccess();
  await seedContent();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

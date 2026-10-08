import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { BudgetPlansModule } from './budget-plans/budget-plans.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { FoodsModule } from './foods/foods.module';
import { HiddenPlacesModule } from './hidden-places/hidden-places.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { ProvincesModule } from './provinces/provinces.module';
import { UpcomingProvincesModule } from './upcoming-provinces/upcoming-provinces.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { StorageModule } from './storage/storage.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // Not a global guard: only the public write endpoints opt in with
    // `@UseGuards(ThrottlerGuard)`. This sets their default window.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }]),
    PrismaModule,
    StorageModule,
    MediaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ProvincesModule,
    UpcomingProvincesModule,
    FoodsModule,
    HiddenPlacesModule,
    BudgetPlansModule,
    NewsletterModule,
    ContactMessagesModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    // Guards run in registration order. JwtAuthGuard must authenticate
    // before PermissionsGuard can inspect the JWT payload.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}

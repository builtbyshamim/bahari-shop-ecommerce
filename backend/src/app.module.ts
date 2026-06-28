import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import { CacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import jwtConfig from './config/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { ImageUploadModule } from './modules/image-upload/image-upload.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandModule } from './modules/brand/brand.module';
import { TagModule } from './tag/tag.module';
import { ProductModule } from './modules/product/product.module';
import { DealsModule } from './modules/deals/deals.module';
import { TopRankingModule } from './modules/top-ranking/top-ranking.module';
import { DeliveryChargesModule } from './modules/delivery-charges/delivery-charges.module';
import { OrdersModule } from './modules/orders/orders.module';
import mailConfig from './config/mail.config';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AccountModule } from './modules/accounting/account/account.module';
import { CategoryModule } from './modules/accounting/category/category.module';
import { TransactionModule } from './modules/accounting/transaction/transaction.module';
import { LedgerModule } from './modules/accounting/ledger/ledger.module';
import { ReportsModule } from './modules/accounting/reports/reports.module';
import { EmployeeModule } from './modules/hrm/employee/employee.module';
import { DegignationModule } from './modules/hrm/degignation/degignation.module';
import { PathaoStoreModule } from './modules/courier-service/pathao-store/pathao-store.module';
import { CourierServiceModule } from './modules/system-modules/courier-service/courier-service.module';
import { CourierServiceTokenModule } from './modules/courier-service/courier-service-token/courier-service-token.module';
import { CustomerRankModule } from './modules/customer-rank/customer-rank.module';
import { OrderSourcesModule } from './modules/order-sources/order-sources.module';
import { BannersModule } from './modules/banners/banners.module';
import { PagesModule } from './modules/pages/pages.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AdminReportsModule } from './modules/admin-reports/admin-reports.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { CompanyInfoModule } from './modules/company-info/company-info.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { FraudCheckModule } from './modules/courier-service/fraud-check/fraud-check.module';
import { OrderPaymentsModule } from './modules/order-payments/order-payments.module';
import { FeaturedSectionsModule } from './modules/featured-sections/featured-sections.module';
import { FeatureTypesModule } from './modules/feature-types/feature-types.module';
import { TrendingSearchModule } from './modules/trending-search/trending-search.module';
import { SubscribersModule } from './modules/subscribers/subscribers.module';
import { SslPaymentModule } from './modules/ssl-payment/ssl-payment.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { BullModule } from '@nestjs/bullmq';
import { BlogCategoryModule } from './modules/blog-category/blog-category.module';
import { BlogPostModule } from './modules/blog-post/blog-post.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, jwtConfig, mailConfig],
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
    }),
    // ✅ BullMQ (background job queues — uses same Redis instance)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        const url = new URL(redisUrl);
        return {
          connection: {
            host: url.hostname,
            port: parseInt(url.port || '6379'),
            password: url.password || undefined,
          },
        };
      },
    }),

    // ✅ CACHE (Keyv + node-redis internally)
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

        return {
          store: new Keyv({
            store: new KeyvRedis(redisUrl, {
              namespace: 'ecommerce:',
            }),
            ttl: 600_000, // 10 minutes
          }),
        };
      },
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        autoLoadEntities: configService.get<boolean>(
          'database.autoLoadEntities',
        ),
        synchronize: configService.get<boolean>('database.synchronize'),
        ssl: configService.get('database.ssl'),
      }),
    }),
    AuthModule,
    UserModule,
    MailModule,
    ImageUploadModule,
    CategoriesModule,
    BrandModule,
    TagModule,
    ProductModule,
    DealsModule,
    TopRankingModule,
    DeliveryChargesModule,
    OrdersModule,
    InventoryModule,
    AccountModule,
    CategoryModule,
    TransactionModule,
    LedgerModule,
    ReportsModule,
    EmployeeModule,
    DegignationModule,
    PathaoStoreModule,
    CourierServiceModule,
    CourierServiceTokenModule,
    CustomerRankModule,
    OrderSourcesModule,
    BannersModule,
    PagesModule,
    TestimonialsModule,
    DashboardModule,
    AdminReportsModule,
    NotificationModule,
    CouponsModule,
    CompanyInfoModule,
    MessagingModule,
    FraudCheckModule,
    OrderPaymentsModule,
    FeaturedSectionsModule,
    FeatureTypesModule,
    TrendingSearchModule,
    SubscribersModule,
    SslPaymentModule,
    GalleryModule,
    BlogPostModule,
    BlogCategoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },

    // ✅ Global Roles Guard
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

import { BullModule } from '@nestjs/bull'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

import { AdminModule } from './admin/admin.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { CompetitionModule } from './competition/competition.module'
import configuration from './config/configuration'
import { IfModule } from './if/if.module'
import { ProfileModule } from './profile/profile.module'
import { ReconstructionModule } from './reconstruction/reconstruction.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: '333.fm',
      password: process.env.MYSQL_PASSWORD ?? '',
      database: '333fm',
      synchronize: true,
      autoLoadEntities: true,
      namingStrategy: new SnakeNamingStrategy(),
      // logging: true,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60 * 1000,
    }),
    IfModule,
    UserModule,
    AuthModule,
    AdminModule,
    CompetitionModule,
    ProfileModule,
    ReconstructionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './data/database.config';
import { UserEntity } from './data/user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisService } from './redis.service';
import { RankingScheduler } from './ranking.scheduler';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: TypeOrmConfigService
        }),
        TypeOrmModule.forFeature([UserEntity])
    ],
    controllers: [AppController],
    providers: [AppService, RedisService, RankingScheduler]
})
export class AppModule {}

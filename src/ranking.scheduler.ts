import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from './redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './data/user.entity';

@Injectable()
export class RankingScheduler implements OnModuleInit {
    constructor(
        private readonly redisService: RedisService,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    onModuleInit() {
        setInterval(async () => {
            const ranking = await this.redisService.getRanking();
            for (const user of ranking) {
                await this.userRepository.update({ id: user.deviceId }, { clickCount: user.score });
            }
            console.log('✅ Redis → MySQL 저장 완료');
        }, 30000); // 30초마다 Redis & 데이터베이스 동기화
    }
}

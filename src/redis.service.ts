import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './data/user.entity';

@Injectable()
export class RedisService {
    private redis: Redis;

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {
        this.redis = new Redis(); // Redis 연결
    }

    // 클릭 수 증가
    async incrementClick(deviceId: string): Promise<void> {
        await this.redis.zincrby('click_ranking', 1, deviceId);
    }

    // 유저 정보가 변경될 때마다 Redis에 nickname을 저장
    async updateNicknameInRedis(deviceId: string, nickname: string): Promise<void> {
        await this.redis.set(`user:${deviceId}:nickname`, nickname);
    }

    // 내 점수 가져오기
    async getUserScore(deviceId: string): Promise<any> {
        const score = await this.redis.zscore('click_ranking', deviceId);
        const nickname = await this.redis.get(`user:${deviceId}:nickname`);

        const ranking = await this.getRanking();

        // 내 점수와 함께 내 순위 계산
        const rank = ranking.findIndex((entry) => entry.deviceId === deviceId) + 1;

        return { deviceId, nickname, score: score ? parseInt(score) : 0, rank };
    }

    // 상위 랭킹 가져오기
    async getRanking(): Promise<any> {
        const ranking = await this.redis.zrevrange('click_ranking', 0, -1, 'WITHSCORES'); // 전체 랭킹 가져오기
        const result = [];

        for (let i = 0; i < ranking.length; i += 2) {
            const deviceId = ranking[i];
            const score = parseInt(ranking[i + 1]);

            // Redis에서 nickname을 바로 가져오기
            const nickname = await this.redis.get(`user:${deviceId}:nickname`);

            result.push({
                deviceId,
                nickname: nickname || 'Unknown', // Redis에 없으면 'Unknown'으로 설정
                score
            });
        }
        return result;
    }
}

import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './data/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
    private redis: Redis;

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private configService: ConfigService
    ) {
        this.redis = new Redis({
            host: this.configService.get<string>('REDIS_HOST') || 'localhost', // Redis 호스트
            port: 6379 // Redis 포트
        });
    }

    // 클릭 수 증가
    async incrementClick(deviceId: string): Promise<void> {
        await this.redis.zincrby('click_ranking', 1, deviceId);
    }

    // 원하는 클릭 수 증가
    async incrementNumClick(deviceId: string, num: number): Promise<void> {
        await this.redis.zincrby('click_ranking', num, deviceId);
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
        const ranking = await this.redis.zrevrange('click_ranking', 0, -1, 'WITHSCORES');
        const result = [];

        const deviceIds = ranking.filter((_, index) => index % 2 === 0);
        const scores = ranking.filter((_, index) => index % 2 === 1).map(Number);

        // 한 번에 nickname 가져오기 (MGET 사용)
        const nicknames = await this.redis.mget(deviceIds.map((id) => `user:${id}:nickname`));

        for (let i = 0; i < deviceIds.length; i++) {
            result.push({
                deviceId: deviceIds[i],
                nickname: nicknames[i] || 'Unknown',
                score: scores[i]
            });
        }

        return result;
    }

    async deleteUser(deviceId: string): Promise<void> {
        // Redis에서 제거
        await this.redis.zrem('click_ranking', deviceId);
        await this.redis.del(`user:${deviceId}:nickname`);
    }

    async devil(deviceId: string, score: number): Promise<void> {
        await this.redis.zadd('click_ranking', score, deviceId);
    }
}

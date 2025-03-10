import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from './redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './data/user.entity';

@Injectable()
export class AppService {
    constructor(
        private readonly redisService: RedisService,
        @InjectRepository(UserEntity)
        private readonly typeormRepository: Repository<UserEntity>
    ) {}

    // 유저 등록
    async register(deviceId: string, nickname: string): Promise<void> {
        const user = await this.typeormRepository.findOne({
            where: { id: deviceId }
        });

        if (!user) {
            const sameNickUser = await this.typeormRepository.findOne({
                where: {
                    nickname: nickname
                }
            });

            if (sameNickUser) {
                throw new BadRequestException(`입력하신 닉네임은 이미 존재하는 닉네임입니다.`);
            }
            // 새로운 유저
            await this.typeormRepository.save(new UserEntity(deviceId, nickname));
        } else {
            user.nickname = nickname;
            await this.typeormRepository.save(user);
        }

        // Redis에 nickname 저장
        await this.redisService.updateNicknameInRedis(deviceId, nickname);

        await this.redisService.incrementClick(deviceId);
    }

    async findByUserId(deviceId: string): Promise<string> {
        const user = await this.typeormRepository.findOne({
            where: {
                id: deviceId
            }
        });

        if (!user) {
            throw new NotFoundException(`해당하는 id(${deviceId})의 사용자가 존재하지 않습니다`);
        }

        return user.id;
    }

    // 클릭 시 호출
    async click(deviceId: string): Promise<void> {
        await this.redisService.incrementClick(deviceId);
    }

    // 내 정보 조회
    async getMyInfo(deviceId: string): Promise<any> {
        return await this.redisService.getUserScore(deviceId);
    }

    async getRanking(): Promise<any> {
        return await this.redisService.getRanking();
    }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from './redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserEntity } from './data/user.entity';

@Injectable()
export class AppService {
    constructor(
        private readonly redisService: RedisService,
        @InjectRepository(UserEntity)
        private readonly typeormRepository: Repository<UserEntity>
    ) {}

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

    async click(deviceId: string): Promise<void> {
        await this.redisService.incrementClick(deviceId);
    }

    async getMyInfo(deviceId: string): Promise<any> {
        return await this.redisService.getUserScore(deviceId);
    }

    async getRanking(): Promise<any> {
        return await this.redisService.getRanking();
    }

    async delete(id: string): Promise<any> {
        const user = await this.typeormRepository.findOne({
            where: {
                id: id
            }
        });

        if (!user) {
            throw new NotFoundException(`해당하는 id(${id}의 사용자가 존재하지 않습니다.`);
        }

        await this.typeormRepository.delete({
            id
        });
        await this.redisService.deleteUser(id);
    }

    async deleteRedis(id: string): Promise<any> {
        await this.redisService.deleteUser(id);
    }

    async devil(id: string, score: number): Promise<void> {
        return await this.redisService.devil(id, score);
    }
}

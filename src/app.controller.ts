import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { RequestUserForm } from './data/request.user.form';
import { RedisService } from './redis.service';
import { Response } from 'express';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly redisService: RedisService
    ) {}

    // 기기 id와 닉네임으로 등록
    @Post('register')
    async register(@Body() form: RequestUserForm): Promise<void> {
        return await this.appService.register(form.deviceId, form.nickname);
    }

    @Post('click/:id')
    async click(@Param('id') deviceId: string): Promise<void> {
        return await this.appService.click(deviceId);
    }

    // 내 정보 조회
    @Get('my-info/:id')
    async myInfo(@Param('id') deviceId: string): Promise<any> {
        const userId = await this.appService.findByUserId(deviceId);

        return await this.appService.getMyInfo(userId);
    }

    @Get('ranking')
    async ranking() {
        return await this.appService.getRanking();
    }

    @Get('sse')
    async getRanking(@Res() res: Response) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        setInterval(async () => {
            const ranking = await this.redisService.getRanking();
            res.write(`data: ${JSON.stringify(ranking)}\n\n`);
        }, 1000); // 1초마다 전송
    }

    @Delete('delete/:id')
    async delete(@Param('id') id: string) {
        return await this.appService.delete(id);
    }
}

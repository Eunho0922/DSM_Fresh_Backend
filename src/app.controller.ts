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

    @Post('register')
    async register(@Body() form: RequestUserForm): Promise<void> {
        return await this.appService.register(form.deviceId, form.nickname);
    }

    @Post('click/:id')
    async click(@Param('id') deviceId: string): Promise<void> {
        return await this.appService.click(deviceId);
    }

    @Post('clickNum/:id')
    async clickNum(
        @Param('id') deviceId: string,
        @Body('num', ParseIntPipe) num: number
    ): Promise<void> {
        return await this.appService.clickNum(deviceId, num);
    }

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
        }, 1000); // 1초마다 랭킹 업데이트
    }

    @Delete('delete/:id')
    async delete(@Param('id') id: string) {
        return await this.appService.delete(id);
    }

    @Delete('delete/reids/:id')
    async deleteRedis(@Param('id') id: string) {
        return await this.appService.deleteRedis(id);
    }

    @Post('devil/:id')
    async devil(@Param('id') id: string, @Body('score', ParseIntPipe) score: number) {
        return await this.appService.devil(id, score);
    }
}

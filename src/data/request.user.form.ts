import { IsNotEmpty, Validate } from 'class-validator';
import { NoBadWordsConstraint } from './badword.check.decorator';

export class RequestUserForm {
    @IsNotEmpty()
    deviceId: string;

    @IsNotEmpty()
    @Validate(NoBadWordsConstraint)
    nickname: string;

    constructor(deviceId: string, nickname: string) {
        this.deviceId = deviceId;
        this.nickname = nickname;
    }
}

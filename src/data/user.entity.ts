import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserEntity {
    @PrimaryColumn('varchar', {
        name: 'DEV_ID',
        length: 100,
        nullable: false
    })
    id: string;

    @Column('varchar', {
        name: 'NICK_NAME',
        length: 100,
        nullable: false
    })
    nickname: string;

    @Column('bigint', {
        name: 'CLICK_CNT',
        nullable: false,
        default: 0,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => Number(value)
        }
    })
    clickCount: number;

    constructor(deviceId: string, nickname: string) {
        this.id = deviceId;
        this.nickname = nickname;
        this.clickCount = 0; // 기본값 설정 (혹은 null로 설정)
    }
}

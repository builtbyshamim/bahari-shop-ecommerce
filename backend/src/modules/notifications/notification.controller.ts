import { Body, Controller, Delete, Post, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

class SaveFcmTokenDto {
  @ApiProperty({ example: 'fcm-device-token-here' })
  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /** Save the caller's FCM token (requires JWT). */
  @Post('fcm-token')
  async saveToken(
    @CurrentUser() user: UserEntity,
    @Body() dto: SaveFcmTokenDto,
  ) {
    await this.notificationService.saveToken(user.id, dto.fcmToken);
    return { message: 'FCM token saved.' };
  }

  /** Remove the caller's FCM token on logout. */
  @Delete('fcm-token')
  async removeToken(@CurrentUser() user: UserEntity) {
    await this.notificationService.removeToken(user.id);
    return { message: 'FCM token removed.' };
  }
}

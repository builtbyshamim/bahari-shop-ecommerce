import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { FcmService } from './fcm.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly fcmService: FcmService,
  ) {}

  /** Save or update the FCM token for a user. */
  async saveToken(userId: string, fcmToken: string): Promise<void> {
    await this.userRepo.update(userId, { fcmToken });
  }

  /** Remove the FCM token for a user (logout / revoke). */
  async removeToken(userId: string): Promise<void> {
    await this.userRepo.update(userId, { fcmToken: null });
  }

  /** Collect all active FCM tokens belonging to admin users. */
  private async getAdminTokens(): Promise<string[]> {
    const admins = await this.userRepo
      .createQueryBuilder('u')
      .select('u.fcmToken')
      .where('u.role = :role', { role: UserRole.ADMIN })
      .andWhere('u.fcmToken IS NOT NULL')
      .andWhere("u.fcmToken != ''")
      .getMany();

    return admins.map((u) => u.fcmToken).filter(Boolean) as string[];
  }

  /** Send a push notification to all admin users. */
  async notifyAdmins(
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const tokens = await this.getAdminTokens();
    if (tokens.length === 0) return;
    await this.fcmService.sendToTokens(tokens, title, body, data);
  }

  /** Send a push notification to a specific user (by user id). */
  async notifyUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'fcmToken'],
    });
    if (!user?.fcmToken) return;
    await this.fcmService.sendToToken(user.fcmToken, title, body, data);
  }
}

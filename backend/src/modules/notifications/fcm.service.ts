import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import serviceAccount from '../../config/firebase/service-account.json';

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private messaging: admin.messaging.Messaging | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    if (!serviceAccount) {
      this.logger.warn(
        'Firebase credentials not configured — FCM notifications disabled.',
      );
      return;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
      });
    }

    this.messaging = admin.messaging();
    this.logger.log('Firebase Admin SDK initialized.');
  }

  /** Send a push notification to a single FCM token. */
  async sendToToken(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!this.messaging) return;
    try {
      await this.messaging.send({
        token,
        notification: { title, body },
        data,
        webpush: {
          notification: { title, body, icon: '/icon-192.png' },
        },
      });
    } catch (err: any) {
      // Stale / invalid tokens are normal — log and move on
      this.logger.warn(
        `FCM send failed (token: ${token.slice(0, 20)}…): ${err.message}`,
      );
    }
  }

  /** Send to multiple tokens using multicast. */
  async sendToTokens(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!this.messaging || tokens.length === 0) return;
    try {
      const res = await this.messaging.sendEachForMulticast({
        tokens,
        notification: { title, body },
        data,
        webpush: {
          notification: { title, body, icon: '/icon-192.png' },
        },
      });
      if (res.failureCount > 0) {
        this.logger.warn(
          `FCM multicast: ${res.successCount} sent, ${res.failureCount} failed.`,
        );
      }
    } catch (err: any) {
      this.logger.error(`FCM multicast error: ${err.message}`);
    }
  }
}

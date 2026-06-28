import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl: string | undefined;
  private readonly apiToken: string | undefined;
  private readonly sid: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('SMS_GATEWAY_URL');
    this.apiToken = this.configService.get<string>('SMS_API_TOKEN');
    this.sid = this.configService.get<string>('SMS_SID');
  }

  async send(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
    if (!this.apiUrl || !this.apiToken) {
      this.logger.warn(`SMS skipped (not configured) — to: ${phone}`);
      return { success: false, error: 'SMS gateway not configured' };
    }

    try {
      const params = new URLSearchParams({
        token: this.apiToken,
        sid: this.sid ?? '',
        msisdn: phone,
        sms: message,
        csmsid: `msg_${Date.now()}`,
      });

      const response = await fetch(`${this.apiUrl}?${params.toString()}`, {
        method: 'GET',
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.logger.log(`SMS sent to ${phone}`);
      return { success: true };
    } catch (error: any) {
      const msg = error?.message || 'Unknown error';
      this.logger.error(`SMS failed to ${phone}: ${msg}`);
      return { success: false, error: msg };
    }
  }

  async sendBulk(
    recipients: { phone: string; name?: string }[],
    message: string,
  ): Promise<{ phone: string; success: boolean; error?: string }[]> {
    return Promise.all(
      recipients.map(async ({ phone, name }) => {
        const personalised = message.replace(/\{\{name\}\}/g, name || 'Customer');
        const result = await this.send(phone, personalised);
        return { phone, ...result };
      }),
    );
  }
}

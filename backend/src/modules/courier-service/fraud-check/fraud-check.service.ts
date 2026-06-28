import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourierServiceToken } from '../courier-service-token/entities/courier-service-token.entity';

export interface FraudCheckResult {
  provider: string;
  available: boolean;
  phone: string;
  data?: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    pendingOrders: number;
    fraudActivity: boolean;
    fraudLevel: string;
  };
  error?: string;
}

// courier_service_id mapping: 1=Pathao, 2=Steadfast, 3=RedX
const STEADFAST_ID = 2;
const REDX_ID = 3;

@Injectable()
export class FraudCheckService {
  private readonly logger = new Logger(FraudCheckService.name);

  constructor(
    @InjectRepository(CourierServiceToken)
    private readonly tokenRepo: Repository<CourierServiceToken>,
  ) {}

  async checkPhone(phone: string): Promise<FraudCheckResult[]> {
    const results = await Promise.all([
      this.checkSteadfast(phone),
      this.checkRedX(phone),
    ]);
    return results;
  }

  private async checkSteadfast(phone: string): Promise<FraudCheckResult> {
    const provider = 'Steadfast Courier';
    try {
      const token = await this.tokenRepo.findOne({
        where: { courier_service_id: STEADFAST_ID, status: 1 },
      });

      if (!token?.api_key || !token?.secret_key) {
        return { provider, available: false, phone, error: 'Steadfast API key not configured' };
      }

      const url = `https://portal.steadfast.com.bd/api/v1/fraud-check/phone/${encodeURIComponent(phone)}`;
      const response = await fetch(url, {
        headers: {
          'Api-Key': token.api_key,
          'Secret-Key': token.secret_key,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(12_000),
      });

      const json: any = await response.json();

      if (!response.ok || json.status >= 400) {
        return { provider, available: true, phone, error: json.message || `HTTP ${response.status}` };
      }

      const d = json.data ?? json;
      return {
        provider,
        available: true,
        phone,
        data: {
          totalOrders: d.total_orders ?? 0,
          completedOrders: d.completed_orders ?? 0,
          cancelledOrders: d.cancelled_orders ?? 0,
          pendingOrders: d.pending_orders ?? 0,
          fraudActivity: !!d.fraud_activity,
          fraudLevel: d.fraud_level ?? 'Unknown',
        },
      };
    } catch (err: any) {
      this.logger.error(`Steadfast fraud check failed for ${phone}: ${err.message}`);
      return { provider, available: true, phone, error: err.message };
    }
  }

  private async checkRedX(phone: string): Promise<FraudCheckResult> {
    const provider = 'RedX Courier';
    try {
      const token = await this.tokenRepo.findOne({
        where: { courier_service_id: REDX_ID, status: 1 },
      });

      if (!token?.api_key) {
        return { provider, available: false, phone, error: 'RedX API key not configured' };
      }

      const url = `https://openapi.redx.com.bd/v1.0.0-beta/parcel/fraud-check?phone=${encodeURIComponent(phone)}`;
      const response = await fetch(url, {
        headers: {
          'API-ACCESS-TOKEN': token.server_generation_token || token.api_key,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(12_000),
      });

      const json: any = await response.json();

      if (!response.ok) {
        return { provider, available: true, phone, error: json.message || `HTTP ${response.status}` };
      }

      const d = json.data ?? json;
      return {
        provider,
        available: true,
        phone,
        data: {
          totalOrders: d.total_orders ?? d.totalOrders ?? 0,
          completedOrders: d.completed_orders ?? d.completedOrders ?? 0,
          cancelledOrders: d.cancelled_orders ?? d.cancelledOrders ?? 0,
          pendingOrders: d.pending_orders ?? d.pendingOrders ?? 0,
          fraudActivity: !!(d.fraud_activity ?? d.isFraud),
          fraudLevel: d.fraud_level ?? d.fraudLevel ?? 'Unknown',
        },
      };
    } catch (err: any) {
      this.logger.error(`RedX fraud check failed for ${phone}: ${err.message}`);
      return { provider, available: true, phone, error: err.message };
    }
  }
}

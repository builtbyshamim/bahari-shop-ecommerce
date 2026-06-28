import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import axios from 'axios';
import { Order } from './entities/order.entity';
import { AssignSteadfastDto } from './dto/assign-courier.dto';
import { AssignPathaoDto } from './dto/assign-courier.dto';
import { CourierServiceToken } from '../courier-service/courier-service-token/entities/courier-service-token.entity';

@Injectable()
export class CourierAssignService {
  constructor(private readonly dataSource: DataSource) { }

  // ── helper: get order + validate not already assigned ──────────────────
  private async getOrderOrThrow(em: any, orderId: string): Promise<Order> {
    const order = await em.findOne(Order, {
      where: { id: orderId },
      relations: ['customer', 'items', 'address'],
    });

    if (!order) throw new BadRequestException('Order not found');

    if (order.consignment_id) {
      throw new BadRequestException(
        `Order already assigned to a courier (consignment: ${order.consignment_id})`,
      );
    }

    return order;
  }

  // ── helper: get token ──────────────────────────────────────────────────
  private async getTokenOrThrow(
    em: any,
    tokenId: number,
  ): Promise<CourierServiceToken> {
    const token = await em.findOne(CourierServiceToken, {
      where: { id: tokenId },
    });
    if (!token) throw new BadRequestException('Courier token not found');
    return token;
  }

  // ────────────────────────────────────────────────────────────────────────
  // STEADFAST
  // ────────────────────────────────────────────────────────────────────────
  async assignSteadfast(dto: AssignSteadfastDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const em = queryRunner.manager;
      const order = await this.getOrderOrThrow(em, dto.order_id);
      const tokenData = await this.getTokenOrThrow(
        em,
        dto.courier_service_token_id,
      );
      console.log(tokenData, 'tokenDatatokenData')

      const payload = {
        invoice: order.orderNumber,
        recipient_name: dto.recipient_name,
        recipient_phone: dto.recipient_phone,
        alternative_phone: dto.alternative_phone || '',
        recipient_email: dto.recipient_email || '',
        recipient_address: dto.recipient_address,
        delivery_type: dto.delivery_type ?? 0,
        note: dto.note || '',
        item_description: dto.item_description || '',
        total_lot: dto.total_lot || 1,
        cod_amount: Number(dto.cod_amount),
      };

      const response = await axios.post(
        'https://portal.packzy.com/api/v1/create_order',
        payload,
        {
          headers: {
            'Api-Key': tokenData.api_key,
            'Secret-Key': tokenData.secret_key,
          },
        },
      );
      console.log(response,'response')

      const responseData = response.data;
      if (!responseData?.consignment) {
        throw new BadRequestException('Invalid response from Steadfast');
      }

      const consignment = responseData.consignment;

      await em.update(Order, order.id, {
        courier_service_id: 2,
        courier_service_token_id: dto.courier_service_token_id,
        consignment_id: consignment.consignment_id ?? null,
        courier_order_status: consignment.status ?? null,
        delivery_fee: consignment.delivery_fee ?? 0,
        tracking_code: consignment.tracking_code ?? null,
      });

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Order assigned to Steadfast successfully',
        consignment_id: consignment.consignment_id,
        tracking_code: consignment.tracking_code,
        steadfast_response: responseData,
      };
    } catch (err) {
      console.log(err,'err')
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        err?.response?.data ?? err?.message ?? 'Steadfast assign failed',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // PATHAO
  // ────────────────────────────────────────────────────────────────────────
  async assignPathao(dto: AssignPathaoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log(dto,'dto')
      const em = queryRunner.manager;
      const order = await this.getOrderOrThrow(em, dto.order_id);
      const tokenData = await this.getTokenOrThrow(
        em,
        dto.courier_service_token_id,
      );

      // 1. Get Pathao access token
      let accessToken: string;
      try {
        const tokenResponse = await axios.post(
          'https://api-hermes.pathao.com/aladdin/api/v1/issue-token',
          {
            client_id: tokenData.api_key,
            client_secret: tokenData.secret_key,
            grant_type: 'password',
            username: tokenData.username,
            password: tokenData.password,
          },
        );
        accessToken = tokenResponse.data.access_token;
        if (!accessToken) throw new Error('No access token');
      } catch (error) {
        throw new BadRequestException(
          error?.response?.data ?? 'Failed to get Pathao access token',
        );
      }

      // 2. Create Pathao order
      const orderPayload = {
        store_id: dto.store_id,
        merchant_order_id: order.orderNumber,
        recipient_name: dto.recipient_name,
        recipient_phone: dto.recipient_phone,
        recipient_address: dto.recipient_address,
        delivery_type: dto.delivery_type ?? 48,
        item_type: dto.item_type ?? 2,
        special_instruction: dto.special_instruction ?? '',
        item_quantity: Number(dto.item_quantity ?? 1),
        item_weight: Number(dto.item_weight ?? 0.5),
        item_description: dto.item_description ?? '',
        amount_to_collect: Number(dto.cod_amount),
      };

      let responseData: any;
      try {
        const orderResponse = await axios.post(
          'https://api-hermes.pathao.com/aladdin/api/v1/orders',
          orderPayload,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        responseData = orderResponse.data;
      } catch (error) {
        throw new BadRequestException(
          error?.response?.data ?? 'Failed to create Pathao order',
        );
      }

      if (responseData?.data) {
        await em.update(Order, order.id, {
          courier_service_id: 1,
          courier_service_token_id: dto.courier_service_token_id,
          consignment_id: responseData.data.consignment_id ?? null,
          courier_order_status: responseData.data.order_status ?? null,
          delivery_fee: responseData.data.delivery_fee ?? null,
        });
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Order assigned to Pathao successfully',
        consignment_id: responseData?.data?.consignment_id,
        pathao_response: responseData,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        err?.response?.data ?? err?.message ?? 'Pathao assign failed',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
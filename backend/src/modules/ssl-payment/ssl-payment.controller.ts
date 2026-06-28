import {
  Body,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { SslPaymentService } from './ssl-payment.service';
import { InitiateSslPaymentDto } from './dto/ssl-payment.dto';
import { PublicRoute } from 'src/common/decorators/public.decorator';

@ApiTags('SSL Payment')
@Controller('ssl-payment')
export class SslPaymentController {
  constructor(private readonly sslPaymentService: SslPaymentService) {}

  // POST /ssl-payment/initiate — called by frontend after order creation
  @Post('initiate')
  @PublicRoute()
  @ApiOperation({ summary: 'Initiate SSL Commerce payment for an order' })
  initiate(@Body() dto: InitiateSslPaymentDto) {
    return this.sslPaymentService.initiate(dto.orderId);
  }

  // POST /ssl-payment/success — SSL Commerce redirects user here after successful payment
  @Post('success')
  @PublicRoute()
  @ApiOperation({ summary: 'SSL Commerce success callback' })
  async handleSuccess(@Req() req: Request, @Res() res: Response) {
    const body = req.body as Record<string, any>;
    const frontendUrl = this.sslPaymentService.getFrontendUrl();
    try {
      const orderId = await this.sslPaymentService.validateAndComplete(body);
      return res.redirect(
        `${frontendUrl}/enjoy/thanks-massage/${orderId}?payment=ssl_success`,
      );
    } catch {
      return res.redirect(`${frontendUrl}/enjoy/payment/fail?reason=validation_failed`);
    }
  }

  // POST /ssl-payment/fail — SSL Commerce redirects user here on payment failure
  @Post('fail')
  @PublicRoute()
  @ApiOperation({ summary: 'SSL Commerce fail callback' })
  async handleFail(@Req() req: Request, @Res() res: Response) {
    const body = req.body as Record<string, any>;
    await this.sslPaymentService.handleFail(body);
    const frontendUrl = this.sslPaymentService.getFrontendUrl();
    return res.redirect(`${frontendUrl}/enjoy/payment/fail`);
  }

  // POST /ssl-payment/cancel — SSL Commerce redirects user here on payment cancel
  @Post('cancel')
  @PublicRoute()
  @ApiOperation({ summary: 'SSL Commerce cancel callback' })
  async handleCancel(@Req() req: Request, @Res() res: Response) {
    const body = req.body as Record<string, any>;
    await this.sslPaymentService.handleCancel(body);
    const frontendUrl = this.sslPaymentService.getFrontendUrl();
    return res.redirect(`${frontendUrl}/enjoy/payment/cancel`);
  }

  // POST /ssl-payment/ipn — server-to-server IPN from SSL Commerce
  @Post('ipn')
  @PublicRoute()
  @ApiOperation({ summary: 'SSL Commerce IPN (server-to-server) notification' })
  async handleIPN(@Req() req: Request) {
    const body = req.body as Record<string, any>;
    try {
      await this.sslPaymentService.validateAndComplete(body);
    } catch {
      // IPN must always return 200 OK — errors handled internally
    }
    return { received: true };
  }
}

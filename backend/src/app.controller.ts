import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PublicRoute } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @PublicRoute()
  root() {
    return 'Deploy successfully 🚀';
  }

  @Get('health')
  @PublicRoute()
  health() {
    return {
      status: 'ok',
      message: 'Server is running 🚀',
      timestamp: new Date(),
    };
  }
}

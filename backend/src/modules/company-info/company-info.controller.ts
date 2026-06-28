import { Body, Controller, Get, Patch, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicRoute } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { CompanyInfoService } from './company-info.service';
import { UpdateCompanyInfoDto } from './dto/update-company-info.dto';

@ApiTags('Company Info')
@Controller('company-info')
export class CompanyInfoController {
  constructor(private readonly service: CompanyInfoService) {}

  @Get()
  @PublicRoute()
  @ApiOperation({ summary: 'Get company info (public)' })
  get() {
    return this.service.get();
  }

  @Patch()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update company info (admin only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
  ]))
  upsert(
    @Body() dto: UpdateCompanyInfoDto,
    @UploadedFiles() files?: { logo?: Express.Multer.File[]; favicon?: Express.Multer.File[] },
  ) {
    return this.service.upsert(dto, files?.logo?.[0], files?.favicon?.[0]);
  }
}

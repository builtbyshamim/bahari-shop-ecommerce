import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { PublicRoute } from 'src/common/decorators/public.decorator';

@ApiTags('Testimonials')
@ApiBearerAuth()
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a testimonial (admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  create(
    @Body() dto: CreateTestimonialDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.testimonialsService.create(dto, avatar);
  }

  @Get()
  @ApiOperation({ summary: 'Get all testimonials (admin)' })
  findAll() {
    return this.testimonialsService.findAll();
  }

  @Get('public')
  @PublicRoute()
  @ApiOperation({ summary: 'Get active testimonials for frontend (public)' })
  findPublic() {
    return this.testimonialsService.findPublic();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get testimonial by ID (admin)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.testimonialsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a testimonial (admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTestimonialDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.testimonialsService.update(id, dto, avatar);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a testimonial (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.testimonialsService.remove(id);
  }
}

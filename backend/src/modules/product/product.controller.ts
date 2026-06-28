import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  Patch,
  UseInterceptors,
  UploadedFiles,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { GetProductsDto } from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImagesService } from './product-images-service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { VendorGuard } from '../auth/guards/vendor.guard';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
// @UseGuards(JwtAuthGuard, VendorGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productImagesService: ProductImagesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new product',
    description: `
## Simple Product Example
\`\`\`json
{
  "name": "Organic Honey",
  "type": "physical",
  "hasVariants": false,
  "basePrice": 350,
  "baseStock": 500,
  "moq": 1
}
\`\`\`

## Variant Product Example (T-Shirt with Color × Size)
\`\`\`json
{
  "name": "Premium T-Shirt",
  "type": "physical",
  "hasVariants": true,
  "options": [
    { "name": "Color", "values": [{"value": "Red", "colorHex": "#FF0000"}, {"value": "Blue"}] },
    { "name": "Size",  "values": [{"value": "M"}, {"value": "L"}] }
  ],
  "variants": [
    { "optionValues": ["Red", "M"], "price": 799, "stock": 50 },
    { "optionValues": ["Red", "L"], "price": 799, "stock": 30 },
    { "optionValues": ["Blue", "M"], "price": 849, "stock": 20 }
  ]
}
\`\`\`
    `,
  })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'SKU already exists' })
  async createProduct(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: UserEntity,
  ) {
    const vendorId = String(user.id) ?? 'test-vendor-id'; // auth থেকে আসবে
    return this.productService.createProduct(vendorId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({
    summary: 'Get all products with pagination, search & filter',
  })
  getProducts(@Query() dto: GetProductsDto) {
    return this.productService.getProducts(dto);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a product' })
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }

  // POST /products/:productId/images  — upload multiple images
  @Post('images/:productId')
  @UseInterceptors(FilesInterceptor('images', 10)) // max 10 files
  uploadImages(
    @Param('productId') productId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productImagesService.uploadImages(productId, files);
  }

  // GET /products/:productId/images
  @Get('images/:productId')
  getImages(@Param('productId') productId: string) {
    return this.productImagesService.getProductImages(productId);
  }

  // DELETE /products/:productId/images/:imageId
  @Delete('images/:imageId')
  deleteImage(@Param('imageId') imageId: string) {
    return this.productImagesService.deleteImage(imageId);
  }

  // PATCH /products/:productId/images/:imageId/thumbnail
  @Patch('images/:imageId/thumbnail/:productId')
  setThumbnail(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productImagesService.setThumbnail(productId, imageId);
  }

  // PATCH /products/:productId/images/reorder
  @Patch('images/reorder/:productId')
  reorderImages(
    @Param('productId') productId: string,
    @Body() body: { orderedIds: string[] },
  ) {
    return this.productImagesService.reorderImages(productId, body.orderedIds);
  }
}

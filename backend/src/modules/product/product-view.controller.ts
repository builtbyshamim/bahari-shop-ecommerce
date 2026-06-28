import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductViewService } from './product-view.services';
import { PublicRoute } from 'src/common/decorators/public.decorator';
import { GetProductsViewDto } from './dto/get-product-view.dto';
import { GetShopProductsViewDto } from './dto/get-shop-product-view.dto';

@ApiTags('Products Views')
@ApiBearerAuth()
@Controller('product-views')
export class ProductViewController {
  constructor(private readonly productService: ProductViewService) {}

  @Get()
  @PublicRoute()
  @ApiOperation({
    summary: 'Get all products with pagination, search & filter',
  })
  getProducts(@Query() dto: GetProductsViewDto) {
    return this.productService.getProducts(dto);
  }

  @Get('get-shop/product-views')
  @PublicRoute()
  @ApiOperation({ summary: 'Get shop products with filters' })
  getShopProducts(@Query() dto: GetShopProductsViewDto) {
    return this.productService.getShopProducts(dto);
  }

  @Get('category-wise-products/:slug')
  @PublicRoute()
  getProductsByProductSlug(@Param('slug') slug: string) {
    return this.productService.getProductsByProductSlug(slug);
  }

  @Get('feature-type/:slug')
  @PublicRoute()
  @ApiOperation({ summary: 'Get products by feature type slug (Redis cached)' })
  getProductsByFeatureTypeSlug(@Param('slug') slug: string) {
    return this.productService.getProductsByFeatureTypeSlug(slug);
  }

  // Dynamic route last — must come after all static segment routes
  @Get(':slug')
  @PublicRoute()
  getOne(@Param('slug') slug: string) {
    return this.productService.getProductById(slug);
  }
}

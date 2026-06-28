import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UserEntity } from '../entities/user.entity';
import { RegisterUserDto } from '../dto/create-user.dto';
import { PublicRoute } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetCustomerDto } from '../dto/get-customer.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) { }
  // Create user
  @Post('register')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserEntity,
  })
  @PublicRoute()
  create(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.create(registerUserDto);
  }

  @Get('profile')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get logged-in user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile' })
  getProfile(@CurrentUser() user: UserEntity) {
    return this.usersService.findById(user.id);
  }

  // Get all users
  @Get('customers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of users' })
  findAll(@Query() query: GetCustomerDto) {
    return this.usersService.findAll(query);
  }

  // Get single user
  @Get('customers/details/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserEntity,
  })
  findOne(@Param('id') id: string) {
    return this.usersService.customerDetailsFindById(id);
  }

  // ✅ PATCH /users/update-profile
  @Patch('update-profile')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Update logged-in user profile' })
  updateProfile(
    @CurrentUser() user: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile({ id: user.id }, updateUserDto);
  }

  @Patch('change-password')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Change password' })
  changePassword(
    @CurrentUser() user: UserEntity,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.id, dto);
  }
  // Delete user (soft delete later)
  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete user by ID' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'User deleted successfully',
  // })
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(id);
  // }

  /**
   * GET /users/profile
   * Get logged-in user's profile
   * Protected route: only accessible by authenticated users with CUSTOMER role
   * Returns basic user info
   */


}

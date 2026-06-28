import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AddressService } from '../services/address.service';
import { CreateAddressDto, UpdateAddressDto } from '../dto/create-address.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/shared/enums/user-role.enum';


@Controller('users/addresses')
export class AddressController {
    constructor(private readonly addressService: AddressService) { }

    @Get()
    @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
    getAll(@CurrentUser() user: { id: string }) {
        return this.addressService.getAll(user.id);
    }

    @Post()
    @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
    create(
        @CurrentUser() user: { id: string },
        @Body() dto: CreateAddressDto,
    ) {
        return this.addressService.create(user.id, dto);
    }

    @Patch(':id')
    @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
    update(
        @CurrentUser() user: { id: string },
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateAddressDto,
    ) {
        return this.addressService.update(user.id, id, dto);
    }

    @Patch(':id/default')
    @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    setDefault(
        @CurrentUser() user: { id: string },
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.addressService.setDefault(user.id, id);
    }

    @Delete(':id')
    @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    remove(
        @CurrentUser() user: { id: string },
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.addressService.remove(user.id, id);
    }
}
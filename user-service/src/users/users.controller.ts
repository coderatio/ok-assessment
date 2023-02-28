import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Error } from 'mongoose';
import { UserCreateDto } from 'src/common/dto/user-create.dto';
import { Responsable } from 'src/common/utils/responsable';
import { UsersService } from './users.service';
import { Response } from 'express';
import { MessagePattern } from '@nestjs/microservices';
import { PrincipalGuard } from 'src/guards/principal.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() userCreateDto: UserCreateDto, @Res() res: Response) {
    const user = await this.usersService.create(userCreateDto);
    user.password = undefined;

    return Responsable.sendSuccess(res, 'Account created successfully.', user);
  }

  @MessagePattern({ role: 'user', cmd: 'get' })
  async getUser(data: { email: string }) {
    return await this.usersService.findByEmail(data.email);
  }

  @Get(':id?')
  @UseGuards(PrincipalGuard)
  async find(@Param('id') id: string, @Res() res: Response) {
    try {
      const query = id ? { _id: id } : {};
      const users = await this.usersService.findAll(query);

      if (id) {
        if (users.length === 0) {
          return Responsable.sendError(res, 'User does not exist', HttpStatus.NOT_FOUND)
        }

        return Responsable.sendSuccess(res, 'User retreived', users.shift());
      }

      return Responsable.sendSuccess(res, 'List of users retreived', users);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error(error.message);
      }

      return Responsable.sendError(
        res,
        'No user found for this ID.',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserCreateDto } from 'src/common/dto/user-create.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import Hash from './../common/utils/hash';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async create(userCreateDto: UserCreateDto): Promise<User> {
    const createdUser = new this.userModel(userCreateDto);
    createdUser.password = await Hash.make(userCreateDto.password);

    return await createdUser.save();
  }

  async findAll(filters?: object): Promise<User[]> {
    return this.userModel.find(filters, { password: false });
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User> {
    return this.userModel.findById(id).select(['-wallet']).exec();
  }
}

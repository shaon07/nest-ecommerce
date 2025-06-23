import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}
  async register(registerUserDto: RegisterUserDto) {
    console.log(registerUserDto);
    const existingUser = await this.userService.findOneByEmail(
      registerUserDto.email,
    );

    if (existingUser) {
      throw new ForbiddenException('Email already exists');
    }

    return await this.userService.findAll();
  }
}

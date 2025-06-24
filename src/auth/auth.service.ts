import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async register(registerUserDto: RegisterUserDto) {
    const existingUser = await this.userService.findOneByEmail(
      registerUserDto.email,
    );

    if (existingUser) {
      throw new ForbiddenException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(registerUserDto.password);
    const user = await this.userService.create({
      email: registerUserDto.email,
      name: registerUserDto.name,
      password: hashedPassword,
    });

    if (!user) {
      throw new ConflictException('there was an error creating the user');
    }

    const tokens = await this.generateToken(user);

    await this.userService.update(user.id, {
      refreshToken: tokens.refreshToken,
    });

    const updatedUser = plainToInstance(
      UserEntity,
      await this.userService.findOne(user.id),
    );

    return {
      user: updatedUser,
      tokens,
    };
  }

  async generateToken(user: UserEntity) {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async generateAccessToken(user: UserEntity) {
    return await this.jwtService.signAsync(
      {
        email: user.email,
        id: user.id,
      },
      {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
        ),
      },
    );
  }
  async generateRefreshToken(user: UserEntity) {
    return await this.jwtService.signAsync(
      {
        id: user.id,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
        ),
      },
    );
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

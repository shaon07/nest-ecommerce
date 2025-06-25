import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login-user.dto';
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

    const hashedPassword = await this.generateHash(registerUserDto.password);
    const user = await this.userService.create({
      email: registerUserDto.email,
      name: registerUserDto.name,
      password: hashedPassword,
    });

    if (!user) {
      throw new ConflictException('there was an error creating the user');
    }

    const tokens = await this.generateToken(user);
    const hashedToken = await this.generateHash(tokens.refreshToken);

    await this.userService.update(user.id, {
      refreshToken: hashedToken,
    });

    const updatedUser = await this.userService.findOne(user.id);

    return {
      user: updatedUser,
      tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const isValidPassword = await this.compareHash(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new ForbiddenException('invalid password');
    }

    const tokens = await this.generateToken(user);
    const hashedRefreshToken = await this.generateHash(tokens.refreshToken);
    await this.userService.update(user.id, {
      refreshToken: hashedRefreshToken,
    });
    const updatedUser = await this.userService.findOne(user.id);
    return {
      user: updatedUser,
      tokens,
    };
  }

  async logout(user: UserEntity) {
    await this.userService.update(user.id, {
      refreshToken: null,
    });

    return user;
  }

  async revalidateRefreshToken(token: string) {
    const payload = await this.jwtService.verifyAsync<{
      id: string;
      iat?: number;
      exp?: number;
    }>(token, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });
    const user = await this.userService.findOne(payload.id);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('token is invalid or user not found');
    }

    const isTokenIsValid = await this.compareHash(token, user.refreshToken);
    if (!isTokenIsValid) {
      throw new UnauthorizedException('token is invalid');
    }
    const tokens = await this.generateToken(user);
    const hashedToken = await this.generateHash(tokens.refreshToken);
    await this.userService.update(user.id, {
      refreshToken: hashedToken,
    });

    return tokens;
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

  async generateHash(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async compareHash(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

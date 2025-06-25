import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Role } from 'src/utility/enums/roles.enum';
import { RequestWithUser } from 'src/utility/types';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorators';
import { LoginDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async create(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@Request() req: RequestWithUser) {
    return await this.authService.logout(req.user);
  }

  @Post('test')
  @Roles(Role.USER)
  @UseGuards(JwtGuard, RolesGuard)
  test() {
    return 'hello';
  }
}

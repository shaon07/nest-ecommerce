import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'email must be a valid email' })
  email: string;

  @IsString({ message: 'password must be a string' })
  password: string;
}

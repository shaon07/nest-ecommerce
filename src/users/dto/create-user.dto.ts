import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'name must be a string' })
  @MinLength(3, { message: 'name must be at least 3 characters long' })
  @MaxLength(50, { message: 'name must be at most 50 characters long' })
  name: string;

  @IsEmail({}, { message: 'email must be a valid email' })
  email: string;

  @IsString({ message: 'password must be a string' })
  password: string;
}

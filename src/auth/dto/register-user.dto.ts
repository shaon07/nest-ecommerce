import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsString({ message: 'name must be a string' })
  name: string;

  @IsEmail({}, { message: 'email must be a valid email' })
  email: string;

  @IsNotEmpty({ message: 'password is required' })
  @MinLength(6, { message: 'password must be at least 6 characters long' })
  @MaxLength(20, { message: 'password must be at most 20 characters long' })
  password: string;
}

import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'title must be a string' })
  @MinLength(3, { message: 'title must be at least 3 characters long' })
  @MaxLength(50, { message: 'title must be at most 50 characters long' })
  title: string;

  @IsString({ message: 'description must be a string' })
  @MinLength(3, { message: 'description must be at least 3 characters long' })
  @MaxLength(50, { message: 'description must be at most 50 characters long' })
  description: string;

  @IsNumber({}, { message: 'price must be a number' })
  price: number;
}

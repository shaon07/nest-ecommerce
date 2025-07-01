import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'name must be a string' })
  @MinLength(3, { message: 'name must be at least 3 characters long' })
  @MaxLength(15, { message: 'name must be at most 15 characters long' })
  name: string;
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto, user: UserEntity) {
    const existingCategory = await this.categoryRepository.findOne({
      where: {
        name: createCategoryDto.name,
      },
    });

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      created_by: user.id,
    });

    if (!category) {
      throw new ConflictException('There was a problem creating the category');
    }
    return await this.categoryRepository.save(category);
  }

  async findAll() {
    return this.categoryRepository.find();
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const existingCategory = await this.categoryRepository.preload({
      id,
      name: updateCategoryDto.name,
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    const updatedCategory =
      await this.categoryRepository.save(existingCategory);

    if (!updatedCategory) {
      throw new ConflictException('There was a problem updating the category');
    }

    return updatedCategory;
  }

  async remove(id: string) {
    const existingCategory = await this.categoryRepository.findOne({
      where: {
        id,
      },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    try {
      await this.categoryRepository.remove(existingCategory);
      return {
        message: 'Category deleted successfully',
      };
    } catch {
      throw new ConflictException('There was a problem deleting the category');
    }
  }
}

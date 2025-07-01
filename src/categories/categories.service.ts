import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
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

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  // update(id: number, updateCategoryDto: UpdateCategoryDto) {
  //   return `This action updates a #${id} category`;
  // }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}

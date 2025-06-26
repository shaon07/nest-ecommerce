import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}
  async create(createProductDto: CreateProductDto, user: UserEntity) {
    const product = this.productRepository.create({
      ...createProductDto,
      user,
    });

    if (!product) {
      throw new UnprocessableEntityException('Product creation failed');
    }

    const savedProduct = await this.productRepository.save(product);

    if (!savedProduct) {
      throw new UnprocessableEntityException('Product creation failed');
    }

    return savedProduct;
  }

  async findAll() {
    return this.productRepository.find({
      relations: ['user'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return updateProductDto;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}

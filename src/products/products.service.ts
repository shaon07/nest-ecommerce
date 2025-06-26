import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { Role } from 'src/utility/enums/roles.enum';
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

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    user: UserEntity,
  ) {
    const existingProduct = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (user.role !== Role.ADMIN && user.id !== existingProduct.user.id) {
      throw new ForbiddenException(
        'You are not authorized to update this product',
      );
    }

    await this.productRepository.update(id, updateProductDto);
    const updatedProduct = await this.productRepository.findOne({
      where: {
        id: existingProduct.id,
      },
      relations: ['user'],
    });
    return updatedProduct;
  }

  async remove(id: string, user: UserEntity) {
    const existingProduct = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (user.role !== Role.ADMIN && user.id !== existingProduct.user.id) {
      throw new ForbiddenException(
        'You are not authorized to delete this product',
      );
    }
    return this.productRepository.delete(id);
  }
}

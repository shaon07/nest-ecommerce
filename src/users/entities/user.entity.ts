import { Exclude } from 'class-transformer';
import { ProductEntity } from 'src/products/entities/product.entity';
import { Role } from 'src/utility/enums/roles.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Exclude()
  @Column({ nullable: true, type: 'text' })
  refreshToken: string | null;

  @OneToMany(() => ProductEntity, (product) => product.user, {
    cascade: ['update', 'insert'],
  })
  products: ProductEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

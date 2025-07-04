import { Request } from 'express';
import { UserEntity } from 'src/users/entities/user.entity';

export interface RequestWithUser extends Request {
  user: UserEntity; // or whatever your user shape is
}

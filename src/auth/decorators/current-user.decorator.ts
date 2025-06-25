import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from 'src/utility/types';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    return user;
  },
);

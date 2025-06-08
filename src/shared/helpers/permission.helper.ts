import { Injectable, ForbiddenException } from '@nestjs/common';
import { Role } from 'src/auth/enums/role.enum';

@Injectable()
export class PermissionHelper {
  checkPermission(
    targetUserId: string,
    user: { sub: string; user_id?: string; admin_id?: string; role?: string },
  ) {
    const userId = user.sub || user.user_id || user.admin_id;

    if (userId !== targetUserId) {
      let message = 'You can only access your own resources';

      if (user.role?.includes('admin')) {
        message = 'Admin access required for this operation';
      } else if (user.role === Role.PREMIUM_USER) {
        message = 'Premium feature: Upgrade required for full access';
      }

      throw new ForbiddenException(message);
    }
  }
}

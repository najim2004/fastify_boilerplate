import prisma from '../../infrastructure/prisma/client';
import { AuthResponse } from './auth.types';

export class AuthService {
  /**
   * Fetches the authenticated user's profile from our database.
   * Better Auth manages the session; this endpoint returns our custom
   * user fields (type, name, etc.) that Better Auth doesn't expose.
   */
  async me(userId: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email ?? '',
        name: user.name,
        type: user.type,
      },
    };
  }
}

export const authService = new AuthService();
export default authService;

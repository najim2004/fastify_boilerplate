import userRepository from './user.repository';
import { User } from '../../../prisma/generated/client';

export class UserService {
  async getUser(id: string): Promise<User | null> {
    return userRepository.findById(id);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return userRepository.update(id, data);
  }
}

export const userService = new UserService();
export default userService;

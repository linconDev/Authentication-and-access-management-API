import { JwtStrategy } from './jwt.strategy';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockUsersService: { findOneByEmail: jest.Mock };

  beforeEach(async () => {
    mockUsersService = {
      findOneByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should validate and return the user if the user exists', async () => {
    const user = { id: 1, email: 'test@example.com' };
    mockUsersService.findOneByEmail.mockResolvedValue(user);
    const result = await strategy.validate({ email: 'test@example.com' });
    expect(result).toEqual(user);
    expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
  });

  it('should throw an UnauthorizedException if user does not exist', async () => {
    mockUsersService.findOneByEmail.mockResolvedValue(null);
    await expect(
      strategy.validate({ email: 'nonexistent@example.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

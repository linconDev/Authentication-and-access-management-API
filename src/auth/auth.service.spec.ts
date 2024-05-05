import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: Partial<UsersService>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    mockUsersService = {
      findOneByEmail: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a valid JWT token for correct credentials', async () => {
    const user = {
      email: 'test@example.com',
      password: await bcrypt.hash('password', 10),
      id: 1,
    };
    (mockUsersService.findOneByEmail as jest.Mock).mockResolvedValue(user);
    (jest.spyOn(bcrypt, 'compare') as any).mockResolvedValue(true);
    (mockJwtService.sign as jest.Mock).mockReturnValue('token');

    const result = await service.login('test@example.com', 'password');
    expect(result).toEqual({ access_token: 'token' });
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      email: user.email,
      sub: user.id,
    });
  });

  it('should throw an UnauthorizedException for incorrect email', async () => {
    (mockUsersService.findOneByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      service.login('wrong@example.com', 'password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw an UnauthorizedException for incorrect password', async () => {
    const user = {
      email: 'test@example.com',
      password: await bcrypt.hash('password', 10),
      id: 1,
    };
    (mockUsersService.findOneByEmail as jest.Mock).mockResolvedValue(user);
    (jest.spyOn(bcrypt, 'compare') as any).mockResolvedValue(false);

    await expect(
      service.login('test@example.com', 'wrongpassword'),
    ).rejects.toThrow(UnauthorizedException);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockAuthService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call AuthService login with correct parameters', async () => {
    const reqBody = { email: 'user@example.com', password: 'password123' };
    const loginResponse = { access_token: 'some-token' };
    (mockAuthService.login as jest.Mock).mockResolvedValue(loginResponse);

    const result = await controller.login(reqBody);

    expect(mockAuthService.login).toHaveBeenCalledWith(
      reqBody.email,
      reqBody.password,
    );
    expect(result).toEqual(loginResponse);
  });

  it('should throw error when invalid credentials are provided', async () => {
    const reqBody = { email: 'wrong@example.com', password: 'wrongpassword' };
    (mockAuthService.login as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid credentials');
    });

    await expect(controller.login(reqBody)).rejects.toThrow(
      'Invalid credentials',
    );
  });
});

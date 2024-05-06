/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LoggerService } from '@logger/logger.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: Partial<UsersService>;
  let mockLoggerService: Partial<LoggerService>;

  beforeEach(async () => {
    mockUsersService = {
      create: jest.fn().mockImplementation((dto: CreateUserDto) =>
        Promise.resolve({
          id: Date.now(),
          ...dto,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      ),
      findOneByEmailRetProfile: jest.fn().mockImplementation((email) =>
        Promise.resolve({
          id: 1,
          name: 'John Doe',
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      ),
      deleteUserById: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    mockLoggerService = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: LoggerService, useValue: mockLoggerService },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: (context: ExecutionContext) => true },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user and return the result', async () => {
    const dto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword',
    };
    const result = await controller.create(dto);

    expect(result).toEqual({
      message: 'User successfully registered',
      id: expect.any(Number),
    });
    expect(mockUsersService.create).toHaveBeenCalledWith(dto);
  });

  it('should handle errors when user registration fails', async () => {
    const dto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword',
    };

    const error = new BadRequestException('Email already in use.');
    (mockUsersService.create as jest.Mock).mockRejectedValue(error);

    const response = await controller.create(dto).catch((e) => e.response);
    expect(response).toEqual({
      statusCode: 400,
      message: 'Email already in use.',
    });
    expect(mockLoggerService.error).toHaveBeenCalledWith(
      `Error saving new user: ${error.message}`,
      error.stack,
    );
  });

  it('should handle generic errors', async () => {
    const dto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'securePassword123',
    };

    const error = new Error('Internal server error');
    (mockUsersService.create as jest.Mock).mockRejectedValue(error);

    const response = await controller.create(dto).catch((e) => e.response);
    expect(response).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
    expect(mockLoggerService.error).toHaveBeenCalledWith(
      `Error saving new user: ${error.message}`,
      error.stack,
    );
  });

  it('should return user profile if authenticated', async () => {
    const req = {
      user: {
        email: 'john@example.com',
      },
    };
    const profile = await controller.getProfile(req);

    expect(profile).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
    expect(mockUsersService.findOneByEmailRetProfile).toHaveBeenCalledWith(
      'john@example.com',
    );
  });

  it('should delete a user successfully when provided a valid user ID', async () => {
    const mockRequest = {
      user: {
        id: 1,
      },
    };
    const result = await controller.deleteUser(mockRequest);

    expect(mockUsersService.deleteUserById).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: 'User account deleted successfully.' });
  });

  it('should throw an error if user ID is not found in the token', async () => {
    const mockRequest = {
      user: {},
    };

    await expect(controller.deleteUser(mockRequest)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockLoggerService.error).toHaveBeenCalledWith(
      'User ID not found in JWT token',
      '',
    );
  });

  it('should handle errors gracefully when deleteUserById fails', async () => {
    const mockRequest = {
      user: { id: 1 },
    };
    const error = new BadRequestException('Failed to delete the user.');
    (mockUsersService.deleteUserById as jest.Mock).mockRejectedValue(error);

    await expect(controller.deleteUser(mockRequest)).rejects.toThrow(
      BadRequestException,
    );
  });
});

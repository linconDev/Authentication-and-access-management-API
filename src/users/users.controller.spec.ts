import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LoggerService } from '@logger/logger.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: Partial<UsersService>;
  let mockLoggerService: Partial<LoggerService>;

  beforeEach(async () => {
    mockUsersService = {
      create: jest.fn().mockImplementation((dto: CreateUserDto) =>
        Promise.resolve({
          id: Date.now(),
          name: dto.name,
          email: dto.email,
          password: dto.password,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      ),
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
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
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
});

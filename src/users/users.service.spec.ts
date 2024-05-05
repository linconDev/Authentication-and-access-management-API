import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LoggerService } from '@logger/logger.service';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: Partial<Repository<User>>;
  let mockLoggerService: Partial<LoggerService>;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully create a new user', async () => {
    const createUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword123',
    };
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);
    (mockUserRepository.create as jest.Mock).mockReturnValue(createUserDto);
    (mockUserRepository.save as jest.Mock).mockResolvedValue({
      id: 1,
      ...createUserDto,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const result = await service.create(createUserDto);
    expect(result).toEqual({
      id: 1,
      ...createUserDto,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it('should throw an error if email already exists', async () => {
    const createUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword123',
    };
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(createUserDto);

    await expect(service.create(createUserDto)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'john@example.com' },
    });
  });

  it('should handle exceptions when saving a user', async () => {
    const createUserDto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'securePassword123',
    };
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);
    (mockUserRepository.create as jest.Mock).mockReturnValue(createUserDto);
    (mockUserRepository.save as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );

    await expect(service.create(createUserDto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return a user if email matches', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

    const result = await service.findOneByEmail('test@example.com');
    expect(result).toEqual(mockUser);
    expect(mockLoggerService.log).toHaveBeenCalledWith(
      'User found for email: test@example.com',
    );
  });

  it('should return null if no user matches', async () => {
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

    const result = await service.findOneByEmail('test@example.com');
    expect(result).toBeNull();
    expect(mockLoggerService.log).toHaveBeenCalledWith(
      'No user found for email: test@example.com',
    );
  });

  it('should handle errors', async () => {
    (mockUserRepository.findOne as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );

    await expect(service.findOneByEmail('error@example.com')).rejects.toThrow(
      BadRequestException,
    );
    expect(mockLoggerService.error).toHaveBeenCalled();
  });
});

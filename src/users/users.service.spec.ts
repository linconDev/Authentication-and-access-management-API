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
      delete: jest.fn(),
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

  it('should return user profile without password', async () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

    const result = await service.findOneByEmailRetProfile('john@example.com');
    expect(result).toEqual(mockUser);
    expect(mockLoggerService.log).toHaveBeenCalledWith(
      'User found for email: john@example.com',
    );
  });

  it('should log and return null when no user is found for email in profile retrieval', async () => {
    const email = 'nonexistent@example.com';
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

    const result = await service.findOneByEmailRetProfile(email);
    expect(result).toBeNull();
    expect(mockLoggerService.log).toHaveBeenCalledWith(
      `No user found for email: ${email}`,
    );
  });

  it('should log an error and throw BadRequestException when an exception occurs during email retrieval', async () => {
    const email = 'error@example.com';
    const mockError = new Error('Database error');

    (mockUserRepository.findOne as jest.Mock).mockRejectedValue(mockError);

    await expect(service.findOneByEmailRetProfile(email)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockLoggerService.error).toHaveBeenCalledWith(
      `Error retrieving user by email: ${mockError.message}`,
      mockError.stack,
    );
  });

  it('should delete a user successfully when a valid ID is provided', async () => {
    (mockUserRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });
    await service.deleteUserById(1);
    expect(mockLoggerService.log).toHaveBeenCalledWith(
      'User deleted with ID: 1',
    );
  });

  it('should throw NotFoundException if no user is found with the provided ID', async () => {
    (mockUserRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });
    await expect(service.deleteUserById(1)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockLoggerService.warn).toHaveBeenCalledWith(
      'No user found with ID: 1',
    );
  });

  it('should throw BadRequestException when no valid ID is provided', async () => {
    await expect(service.deleteUserById(null)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockLoggerService.error).toHaveBeenCalledWith(
      'Attempted to delete a user without a valid ID',
      '',
    );
  });

  it('should handle errors during the deletion process', async () => {
    const error = new Error('Database error');
    (mockUserRepository.delete as jest.Mock).mockRejectedValue(error);
    await expect(service.deleteUserById(1)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockLoggerService.error).toHaveBeenCalledWith(
      'Error deleting user: Database error',
      error.stack,
    );
  });
});

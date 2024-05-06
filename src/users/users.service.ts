import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '@logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn(`Attempt to register with used email: ${email}`);
      throw new BadRequestException('Email alread in use.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    try {
      const savedUser = await this.userRepository.save(newUser);
      this.logger.log(`New user registered: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error saving new user: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to save new user.');
    }
  }

  async findOneByEmailRetProfile(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        select: ['id', 'name', 'email', 'created_at', 'updated_at'],
        where: { email },
      });
      if (!user) {
        this.logger.log(`No user found for email: ${email}`);
        return null;
      }
      this.logger.log(`User found for email: ${email}`);
      return user;
    } catch (error) {
      this.logger.error(
        `Error retrieving user by email: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Error retrieving user information.');
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });
      if (!user) {
        this.logger.log(`No user found for email: ${email}`);
        return null;
      }
      this.logger.log(`User found for email: ${email}`);
      return user;
    } catch (error) {
      this.logger.error(
        `Error retrieving user by email: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Error retrieving user information.');
    }
  }
}

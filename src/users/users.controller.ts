import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Get,
  Request,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggerService } from '@logger/logger.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private logger: LoggerService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<any> {
    try {
      const user = await this.usersService.create(createUserDto);
      return { message: 'User successfully registered', id: user.id };
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.error(
          `Error saving new user: ${error.message}`,
          error.stack,
        );
        return { statusCode: 400, message: error.message };
      }
      this.logger.error(`Error saving new user: ${error.message}`, error.stack);
      return { statusCode: 500, message: 'Internal server error' };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@Request() req) {
    return this.usersService.findOneByEmailRetProfile(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({
    status: 200,
    description: 'User account deleted successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteUser(@Request() req) {
    if (!req.user.id) {
      this.logger.error('User ID not found in JWT token', '');
      throw new BadRequestException('Invalid token: User ID not found.');
    }

    await this.usersService.deleteUserById(req.user.id);
    return { message: 'User account deleted successfully.' };
  }
}

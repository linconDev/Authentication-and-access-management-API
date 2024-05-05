import { ApiProperty } from '@nestjs/swagger';
import { Trim } from 'class-sanitizer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 100)
  @Trim()
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @Trim()
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  password: string;
}

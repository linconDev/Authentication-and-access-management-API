import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should require a valid email', async () => {
    const dto = new CreateUserDto();
    dto.name = 'John Doe';
    dto.email = 'invalid-email';
    dto.password = 'validPassword123';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toEqual('email');
  });

  it('should validate the password length', async () => {
    const dto = new CreateUserDto();
    dto.name = 'John Doe';
    dto.email = 'john@example.com';
    dto.password = 'short';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toEqual('password');
  });

  it('should pass all validations for valid data', async () => {
    const dto = new CreateUserDto();
    dto.name = 'Jane Doe';
    dto.email = 'jane@example.com';
    dto.password = 'complexPassword123';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

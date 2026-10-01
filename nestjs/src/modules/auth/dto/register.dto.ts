import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username solo puede contener letras, números y guiones bajos',
  })
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 72, {
    message: 'password debe tener entre 6 y 72 caracteres',
  })
  password: string;
}

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(
      dto.username,
      dto.email,
      passwordHash,
    );

    return {
      access_token: this.signToken(user),
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const user = await this.usersService.findByEmail(dto.email);
    const passwordValid = user
      ? await bcrypt.compare(dto.password, user.password)
      : false;

    if (!user || !passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      access_token: this.signToken(user),
      user: this.sanitizeUser(user),
    };
  }

  getProfile(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  private signToken(user: User): string {
    const payload = { sub: user.id, email: user.email, username: user.username };
    return this.jwtService.sign(payload);
  }

  /** Evita que el hash de contraseña salga en cualquier respuesta JSON. */
  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

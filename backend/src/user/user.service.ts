import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient } from '@prisma/client';
import { User } from './user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  private prisma = new PrismaClient();

  constructor(private emailService: EmailService) {}

  async create(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
    if (existing) {
      throw new BadRequestException('Un utilisateur avec cet email existe déjà.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        emailVerificationCode,
        isEmailVerified: false,
      },
    });

    // Send verification email with code
    await this.emailService.sendVerificationEmail(createUserDto.email, emailVerificationCode);

    return { message: 'Un email de vérification a été envoyé à votre adresse email.' };
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async verifyEmail(code: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationCode: code },
    });

    if (!user) {
      throw new BadRequestException('Code de vérification invalide.');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Cet email est déjà vérifié.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationCode: null,
      },
    });

    return { message: 'Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter.' };
  }
}

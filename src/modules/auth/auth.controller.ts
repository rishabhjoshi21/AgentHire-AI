import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './auth.dto';
import type { JwtPayload } from './auth.dto';
import { AuthService } from './auth.service';
import { SuccessMessage } from '@/shared/decorators/response.decorator';
import { AUTH_SUCCESS_MESSAGES } from '@/shared/constants/messages';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { AUTH_HEADERS } from './auth.constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register endpoint
  @SuccessMessage(AUTH_SUCCESS_MESSAGES.REGISTER)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);

    return user;
  }

  // Login endpoint
  @SuccessMessage(AUTH_SUCCESS_MESSAGES.LOGIN)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const response = await this.authService.login(loginDto);

    return response;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage(AUTH_SUCCESS_MESSAGES.REFRESH_TOKEN)
  refreshToken(@Headers(AUTH_HEADERS.REFRESH_TOKEN) refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}

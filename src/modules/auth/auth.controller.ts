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
import {
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  UserProfileResponseDto,
} from './auth.dto';
import type { JwtPayload } from './auth.dto';
import { AuthService } from './auth.service';
import { SuccessMessage } from '@/shared/decorators/response.decorator';
import { AUTH_SUCCESS_MESSAGES } from '@/shared/constants/messages';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { AUTH_HEADERS } from './auth.constants';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiSuccess, ApiCreated } from '@/shared/utils/swagger.util';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register endpoint
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account.',
  })
  @ApiCreated(UserProfileResponseDto)
  @ApiBadRequestResponse({
    description: 'Validation failed.',
  })
  @SuccessMessage(AUTH_SUCCESS_MESSAGES.REGISTER)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);

    return user;
  }

  // Login endpoint
  @ApiOperation({
    summary: 'Authenticate user',
    description: 'Authenticates the user and returns JWT tokens.',
  })
  @ApiSuccess(LoginResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password.',
  })
  @SuccessMessage(AUTH_SUCCESS_MESSAGES.LOGIN)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const response = await this.authService.login(loginDto);

    return response;
  }

  // profile endpoint
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
  })
  @ApiSuccess(UserProfileResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }

  // Refresh token endpoint
  @ApiOperation({
    summary: 'Refresh access token',
  })
  @ApiHeader({
    name: AUTH_HEADERS.REFRESH_TOKEN,
    required: true,
    description: 'Valid refresh token',
  })
  @ApiSuccess(LoginResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Refresh token is invalid or expired.',
  })
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage(AUTH_SUCCESS_MESSAGES.REFRESH_TOKEN)
  refreshToken(@Headers(AUTH_HEADERS.REFRESH_TOKEN) refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}

export const AUTH_SUCCESS_MESSAGES = {
  REGISTER: 'User registered successfully.',
  LOGIN: 'Login successful.',
  LOGOUT: 'Logout successful.',
  REFRESH_TOKEN: 'Token refreshed successfully.',
} as const;

export const AUTH_ERROR_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'Email already exists.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED: 'Session expired.',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token.',
} as const;

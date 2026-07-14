import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hash(value: string, saltRounds: number): Promise<string> {
  return bcrypt.hash(value, saltRounds);
}

export async function compare(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}

export function generateSessionId(): string {
  return randomUUID();
}

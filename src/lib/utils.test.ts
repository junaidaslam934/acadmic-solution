import { describe, it, expect } from 'vitest';
import { cn, validateEmail, validatePassword } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'conditional')).toBe('base');
    expect(cn('base', true && 'conditional')).toBe('base conditional');
  });

  it('deduplicates tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('handles undefined and null gracefully', () => {
    expect(cn(undefined, null as any, 'a')).toBe('a');
  });

  it('handles object syntax', () => {
    expect(cn({ 'text-red-700': true, 'text-blue-700': false })).toBe('text-red-700');
  });

  it('returns empty string with no arguments', () => {
    expect(cn()).toBe('');
  });
});

describe('validateEmail', () => {
  it('accepts standard email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('student@ned.edu.pk')).toBe(true);
    expect(validateEmail('teacher+alias@domain.org')).toBe(true);
  });

  it('rejects missing @ symbol', () => {
    expect(validateEmail('nodomain.com')).toBe(false);
  });

  it('rejects missing local part', () => {
    expect(validateEmail('@domain.com')).toBe(false);
  });

  it('rejects missing TLD/domain part', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('rejects email with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false);
    expect(validateEmail('user@ example.com')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('rejects plain text without @', () => {
    expect(validateEmail('justtext')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts passwords with exactly 6 characters', () => {
    expect(validatePassword('abcdef')).toBe(true);
  });

  it('accepts passwords longer than 6 characters', () => {
    expect(validatePassword('securepassword123')).toBe(true);
  });

  it('rejects passwords shorter than 6 characters', () => {
    expect(validatePassword('abc')).toBe(false);
    expect(validatePassword('12345')).toBe(false);
  });

  it('rejects empty password', () => {
    expect(validatePassword('')).toBe(false);
  });

  it('accepts passwords with special characters', () => {
    expect(validatePassword('P@ssw0rd!')).toBe(true);
  });
});

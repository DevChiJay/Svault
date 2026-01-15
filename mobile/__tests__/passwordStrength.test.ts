/**
 * Unit Tests for Password Strength Utility
 */

import { calculatePasswordStrength, getPasswordFeedback } from '../utils/passwordStrength';

describe('Password Strength Utility', () => {
  describe('calculatePasswordStrength', () => {
    it('should return very weak for empty password', () => {
      const result = calculatePasswordStrength('');
      expect(result.score).toBe(0);
      expect(result.strength).toBe('Very Weak');
    });

    it('should return weak for short password', () => {
      const result = calculatePasswordStrength('abc');
      expect(result.score).toBeLessThan(40);
      expect(result.strength).toBe('Weak');
    });

    it('should return fair for medium complexity password', () => {
      const result = calculatePasswordStrength('password123');
      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.score).toBeLessThan(60);
      expect(result.strength).toBe('Fair');
    });

    it('should return good for strong password', () => {
      const result = calculatePasswordStrength('MyP@ssw0rd!');
      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.score).toBeLessThan(80);
      expect(result.strength).toBe('Good');
    });

    it('should return very strong for complex password', () => {
      const result = calculatePasswordStrength('MyV3ry$tr0ng&C0mpl3x!P@ssw0rd');
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.strength).toBe('Very Strong');
    });

    it('should give higher score for longer passwords', () => {
      const short = calculatePasswordStrength('Abc123!');
      const long = calculatePasswordStrength('Abc123!Abc123!Abc123!');
      expect(long.score).toBeGreaterThan(short.score);
    });

    it('should give higher score for diverse character sets', () => {
      const simple = calculatePasswordStrength('abcdefghij');
      const diverse = calculatePasswordStrength('Abc123!@#$');
      expect(diverse.score).toBeGreaterThan(simple.score);
    });
  });

  describe('getPasswordFeedback', () => {
    it('should suggest adding length for short passwords', () => {
      const feedback = getPasswordFeedback('Abc1!');
      expect(feedback).toContain('Use at least 8 characters');
    });

    it('should suggest adding uppercase for lowercase-only passwords', () => {
      const feedback = getPasswordFeedback('password123!');
      expect(feedback).toContain('Add uppercase letters');
    });

    it('should suggest adding lowercase for uppercase-only passwords', () => {
      const feedback = getPasswordFeedback('PASSWORD123!');
      expect(feedback).toContain('Add lowercase letters');
    });

    it('should suggest adding numbers for non-numeric passwords', () => {
      const feedback = getPasswordFeedback('Password!@#');
      expect(feedback).toContain('Add a number');
    });

    it('should suggest adding special characters', () => {
      const feedback = getPasswordFeedback('Password123');
      expect(feedback).toContain('Add a special character');
    });

    it('should return empty array for strong passwords', () => {
      const feedback = getPasswordFeedback('MyV3ry$tr0ng!P@ssw0rd');
      expect(feedback).toHaveLength(0);
    });
  });
});

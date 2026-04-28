import { describe, it, expect } from 'vitest';
import { validateHabitName } from '@/lib/validators';

describe('validateHabitName', () => {
  it('returns an error when habit name is empty', () => {
    expect(validateHabitName('')).toMatchObject({ valid: false, error: 'Habit name is required' });
    expect(validateHabitName('   ')).toMatchObject({ valid: false, error: 'Habit name is required' });
  });

  it('returns an error when habit name exceeds 60 characters', () => {
    const long = 'a'.repeat(61);
    expect(validateHabitName(long)).toMatchObject({
      valid: false,
      error: 'Habit name must be 60 characters or fewer',
    });
  });

  it('returns a trimmed value when habit name is valid', () => {
    expect(validateHabitName('  Drink Water  ')).toMatchObject({
      valid: true,
      value: 'Drink Water',
      error: null,
    });
  });
});

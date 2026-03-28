import { TestBed } from '@angular/core/testing';
import { FormatDatePipe } from './format-date.pipe';
import { provideTestNiordConfig } from '../../testing/test-config';

describe('FormatDatePipe', () => {
  let pipe: FormatDatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTestNiordConfig()] });
    pipe = TestBed.runInInjectionContext(() => new FormatDatePipe());
  });

  it('should format ISO string', () => {
    const result = pipe.transform('2024-03-15T10:30:00Z', 'yyyy-MM-dd');
    expect(result).toBe('2024-03-15');
  });

  it('should format number (timestamp)', () => {
    const ts = new Date('2024-01-01T00:00:00Z').getTime();
    const result = pipe.transform(ts, 'yyyy');
    expect(result).toContain('2024');
  });

  it('should format Date object', () => {
    const result = pipe.transform(new Date(2024, 5, 15), 'yyyy-MM-dd');
    expect(result).toBe('2024-06-15');
  });

  it('should return empty string for null/undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should use custom format', () => {
    const result = pipe.transform('2024-03-15T10:30:00Z', 'dd/MM/yyyy');
    expect(result).toBe('15/03/2024');
  });
});

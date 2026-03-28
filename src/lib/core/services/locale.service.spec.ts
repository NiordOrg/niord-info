import { TestBed } from '@angular/core/testing';
import { LocaleService } from './locale.service';
import { provideTestNiordConfig } from '../../testing/test-config';

describe('LocaleService', () => {
  let service: LocaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTestNiordConfig()] });
    service = TestBed.inject(LocaleService);
  });

  it('should return locale for configured language', () => {
    const locale = service.getDateFnsLocale('en');
    expect(locale).toBeDefined();
    expect(locale.code).toBe('en-GB');
  });

  it('should fall back to default language for unknown lang', () => {
    const locale = service.getDateFnsLocale('fr');
    expect(locale.code).toBe('en-GB');
  });

  it('should return 7 days of week', () => {
    const days = service.getDaysOfWeek('en');
    expect(days).toHaveLength(7);
    expect(days[0]).toBe('Su');
  });

  it('should return 12 month names', () => {
    const months = service.getMonthNames('en');
    expect(months).toHaveLength(12);
    expect(months[0]).toBe('Jan');
  });

  it('should return Danish locale for da', () => {
    const locale = service.getDateFnsLocale('da');
    expect(locale).toBeDefined();
    expect(locale.code).toBe('da');
  });
});

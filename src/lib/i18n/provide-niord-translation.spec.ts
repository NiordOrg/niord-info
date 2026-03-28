import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { provideNiordInfo } from '../provide-niord-info';
import { enGB } from 'date-fns/locale/en-GB';
import { da } from 'date-fns/locale/da';

describe('provideNiordInfo() Transloco integration', () => {
  it('should configure Transloco with defaultLanguage from config', () => {
    TestBed.configureTestingModule({
      providers: [
        provideNiordInfo({
          languages: ['da', 'en'],
          defaultLanguage: 'da',
          timeZone: 'Europe/Copenhagen',
          executionMode: 'DEVELOPMENT',
          wmsLayer: false,
          rootAreas: [],
          locales: { da, en: enGB },
        }),
      ],
    });
    const transloco = TestBed.inject(TranslocoService);
    expect(transloco).toBeDefined();
    expect(transloco.getDefaultLang()).toBe('da');
  });

  it('should use English as default when configured', () => {
    TestBed.configureTestingModule({
      providers: [
        provideNiordInfo({
          languages: ['en'],
          defaultLanguage: 'en',
          timeZone: 'UTC',
          executionMode: 'DEVELOPMENT',
          wmsLayer: false,
          rootAreas: [],
          locales: { en: enGB },
        }),
      ],
    });
    const transloco = TestBed.inject(TranslocoService);
    expect(transloco.getDefaultLang()).toBe('en');
  });
});

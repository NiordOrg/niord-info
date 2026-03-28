import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageService } from './language.service';
import { provideTestNiordConfig } from '../../testing/test-config';

describe('LanguageService', () => {
  let service: LanguageService;
  let translocoSpy: { setActiveLang: ReturnType<typeof vi.fn>; setAvailableLangs: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.removeItem('language');
    translocoSpy = {
      setActiveLang: vi.fn(),
      setAvailableLangs: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [provideTestNiordConfig(), { provide: TranslocoService, useValue: translocoSpy }],
    });
    service = TestBed.inject(LanguageService);
  });

  afterEach(() => {
    localStorage.removeItem('language');
  });

  it('should initialize from first configured language when no localStorage', () => {
    expect(service.language()).toBe('en');
  });

  it('should initialize from localStorage when set', () => {
    localStorage.setItem('language', 'da');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideTestNiordConfig(), { provide: TranslocoService, useValue: translocoSpy }],
    });
    const svc = TestBed.inject(LanguageService);
    expect(svc.language()).toBe('da');
  });

  it('should update signal on setLanguage', () => {
    service.setLanguage('da');
    expect(service.language()).toBe('da');
  });

  it('should fall back to first language for invalid lang', () => {
    service.setLanguage('fr');
    expect(service.language()).toBe('en');
  });

  it('should set available langs on Transloco during construction', () => {
    expect(translocoSpy.setAvailableLangs).toHaveBeenCalledWith(['en', 'da']);
  });

  it('should sync document.documentElement.lang via effect', () => {
    service.setLanguage('da');
    TestBed.flushEffects();
    expect(document.documentElement.lang).toBe('da');
  });

  it('should prefer URL language param over localStorage', () => {
    localStorage.setItem('language', 'da');
    const mockDoc = {
      ...document,
      defaultView: { location: { search: '?language=en' } },
      documentElement: document.documentElement,
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideTestNiordConfig(),
        { provide: TranslocoService, useValue: translocoSpy },
        { provide: DOCUMENT, useValue: mockDoc },
      ],
    });
    const svc = TestBed.inject(LanguageService);
    expect(svc.language()).toBe('en');
  });

  it('should fall back to en when no languages configured and no localStorage', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideTestNiordConfig({ languages: [], defaultLanguage: 'en' }),
        { provide: TranslocoService, useValue: translocoSpy },
      ],
    });
    const svc = TestBed.inject(LanguageService);
    expect(svc.language()).toBe('en');
  });
});

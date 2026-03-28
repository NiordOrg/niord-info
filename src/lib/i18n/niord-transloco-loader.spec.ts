import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NiordTranslocoLoader } from './niord-transloco-loader';
import { DEFAULT_TRANSLATIONS } from './default-translations';

describe('NiordTranslocoLoader', () => {
  let loader: NiordTranslocoLoader;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    loader = TestBed.inject(NiordTranslocoLoader);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should merge defaults + translations + branding', () => {
    let result: Record<string, string> | undefined;
    loader.getTranslation('en').subscribe((r) => (result = r as Record<string, string>));

    httpTesting.expectOne('./assets/i18n/en.json').flush({ CUSTOM_KEY: 'custom' });
    httpTesting.expectOne('./assets/branding/en.json').flush({ BRAND_KEY: 'brand' });

    expect(result!['MENU_NW']).toBe(DEFAULT_TRANSLATIONS['en']['MENU_NW']);
    expect(result!['CUSTOM_KEY']).toBe('custom');
    expect(result!['BRAND_KEY']).toBe('brand');
  });

  it('should let branding override translations override defaults', () => {
    let result: Record<string, string> | undefined;
    loader.getTranslation('en').subscribe((r) => (result = r as Record<string, string>));

    httpTesting.expectOne('./assets/i18n/en.json').flush({ MENU_NW: 'from-translations' });
    httpTesting.expectOne('./assets/branding/en.json').flush({ MENU_NW: 'from-branding' });

    expect(result!['MENU_NW']).toBe('from-branding');
  });

  it('should handle missing translations file gracefully', () => {
    let result: Record<string, string> | undefined;
    loader.getTranslation('en').subscribe((r) => (result = r as Record<string, string>));

    httpTesting.expectOne('./assets/i18n/en.json').error(new ProgressEvent('error'));
    httpTesting.expectOne('./assets/branding/en.json').flush({});

    expect(result!['MENU_NW']).toBe(DEFAULT_TRANSLATIONS['en']['MENU_NW']);
  });

  it('should handle missing branding file gracefully', () => {
    let result: Record<string, string> | undefined;
    loader.getTranslation('en').subscribe((r) => (result = r as Record<string, string>));

    httpTesting.expectOne('./assets/i18n/en.json').flush({});
    httpTesting.expectOne('./assets/branding/en.json').error(new ProgressEvent('error'));

    expect(result).toBeDefined();
    expect(result!['MENU_NW']).toBe(DEFAULT_TRANSLATIONS['en']['MENU_NW']);
  });

  it('should fall back to English defaults for unknown language', () => {
    let result: Record<string, string> | undefined;
    loader.getTranslation('fr').subscribe((r) => (result = r as Record<string, string>));

    httpTesting.expectOne('./assets/i18n/fr.json').error(new ProgressEvent('error'));
    httpTesting.expectOne('./assets/branding/fr.json').error(new ProgressEvent('error'));

    expect(result!['MENU_NW']).toBe(DEFAULT_TRANSLATIONS['en']['MENU_NW']);
  });
});

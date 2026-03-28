import { Provider, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { of } from 'rxjs';
import { enGB } from 'date-fns/locale/en-GB';
import { da } from 'date-fns/locale/da';
import { NiordInfoConfig, NIORD_INFO_CONFIG } from '../niord-info.config';
import { DEFAULT_TRANSLATIONS } from '../i18n/default-translations';

export const TEST_CONFIG: NiordInfoConfig = {
  languages: ['en', 'da'],
  defaultLanguage: 'en',
  timeZone: 'Europe/Copenhagen',
  executionMode: 'DEVELOPMENT',
  wmsLayer: false,
  rootAreas: [
    { areaId: 'urn:mrn:iho:country:dk', latitude: 56.0, longitude: 11.0, zoomLevel: 7 },
  ],
  locales: { en: enGB, da },
};

export function provideTestNiordConfig(overrides?: Partial<NiordInfoConfig>): Provider {
  return { provide: NIORD_INFO_CONFIG, useValue: { ...TEST_CONFIG, ...overrides } };
}

export function getTranslocoTestingModule() {
  return TranslocoTestingModule.forRoot({
    langs: { en: DEFAULT_TRANSLATIONS['en'], da: DEFAULT_TRANSLATIONS['da'] ?? DEFAULT_TRANSLATIONS['en'] },
    translocoConfig: {
      defaultLang: 'en',
      availableLangs: ['en', 'da'],
    },
  });
}

/**
 * Provides a lightweight TranslocoService spy for tests that don't render
 * templates with `| transloco` pipe. For template-rendering tests, use
 * `getTranslocoTestingModule()` in the imports array instead.
 */
export function provideTranslocoSpy(): Provider {
  return {
    provide: TranslocoService,
    useValue: {
      translate: vi.fn((k: string) => k),
      setActiveLang: vi.fn(),
      setAvailableLangs: vi.fn(),
      selectTranslation: vi.fn(() => of({})),
    },
  };
}

/**
 * Creates a mock MessagesComponent parent for child view component tests.
 */
export function createMockMessagesParent(overrides?: Record<string, unknown>) {
  return {
    messages: signal([]),
    rootArea: signal(undefined),
    subAreas: signal([]),
    mainTypes: signal({ NW: true, NM: true }),
    activeNow: signal(false),
    loading: signal(false),
    ...overrides,
  };
}

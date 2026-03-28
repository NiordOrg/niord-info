import { InjectionToken, Type } from '@angular/core';
import type { Locale } from 'date-fns';

export interface RootAreaSpec {
  areaId: string;
  latitude: number;
  longitude: number;
  zoomLevel: number;
}

export interface NiordInfoConfig {
  languages: string[];
  defaultLanguage: string;
  timeZone: string;
  executionMode: string;
  wmsLayer: boolean;
  rootAreas: RootAreaSpec[];
  /** Custom footer component. If omitted, a minimal default footer is rendered. */
  footerComponent?: Type<unknown>;
  /**
   * Base URL for API requests (e.g. 'https://niord.example.com').
   * When set, the interceptor prepends this to all `/api/` requests.
   * When omitted, requests use relative URLs (same-origin / reverse-proxy).
   */
  apiBaseUrl?: string;
  /** Map of language code → date-fns Locale object. Keys should match entries in `languages`. */
  locales: Record<string, Locale>;
  /** Map of language code → flag image path. Defaults to `assets/img/flags/{lang}.png` if omitted. */
  languageFlags?: Record<string, string>;
}

export const NIORD_INFO_CONFIG = new InjectionToken<NiordInfoConfig>('NIORD_INFO_CONFIG');

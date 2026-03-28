import { Injectable, inject } from '@angular/core';
import type { Day, Locale, Month } from 'date-fns';
import { NIORD_INFO_CONFIG } from '../../niord-info.config';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly config = inject(NIORD_INFO_CONFIG);

  getDateFnsLocale(lang: string): Locale {
    return this.config.locales[lang] ?? this.config.locales[this.config.defaultLanguage];
  }

  getDaysOfWeek(lang: string): string[] {
    const locale = this.getDateFnsLocale(lang);
    return Array.from({ length: 7 }, (_, i) => locale.localize!.day(i as Day, { width: 'short' }));
  }

  getMonthNames(lang: string): string[] {
    const locale = this.getDateFnsLocale(lang);
    return Array.from({ length: 12 }, (_, i) => locale.localize!.month(i as Month, { width: 'abbreviated' }));
  }
}

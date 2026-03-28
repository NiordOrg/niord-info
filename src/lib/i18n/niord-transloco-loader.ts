import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable, of, catchError, forkJoin, map } from 'rxjs';
import { DEFAULT_TRANSLATIONS } from './default-translations';

@Injectable({ providedIn: 'root' })
export class NiordTranslocoLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string): Observable<Translation> {
    const defaults = DEFAULT_TRANSLATIONS[lang] ?? DEFAULT_TRANSLATIONS['en'] ?? {};
    const translations$ = this.http
      .get<Record<string, string>>(`./assets/i18n/${lang}.json`)
      .pipe(catchError(() => of({})));
    const branding$ = this.http
      .get<Record<string, string>>(`./assets/branding/${lang}.json`)
      .pipe(catchError(() => of({})));
    return forkJoin([translations$, branding$]).pipe(
      map(([translations, branding]) => ({ ...defaults, ...translations, ...branding })),
    );
  }
}

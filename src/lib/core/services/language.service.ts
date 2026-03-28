import { Injectable, inject, signal, effect, DOCUMENT } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly appConfig = inject(AppConfigService);
  private readonly document = inject(DOCUMENT);

  readonly language = signal<string>(this.resolveInitialLanguage());

  constructor() {
    this.transloco.setAvailableLangs(this.appConfig.languages());

    effect(() => {
      const lang = this.language();
      this.transloco.setActiveLang(lang);
      this.document.documentElement.lang = lang;
      localStorage.setItem('language', lang);
    });
  }

  setLanguage(lang: string): void {
    this.language.set(this.validatedLanguage(lang));
  }

  private resolveInitialLanguage(): string {
    const params = new URLSearchParams(this.document.defaultView?.location?.search ?? '');
    const urlLang = params.get('language') || params.get('lang');
    const storedLang = localStorage.getItem('language');
    return this.validatedLanguage(urlLang || storedLang || this.appConfig.languages()[0] || 'en');
  }

  private validatedLanguage(lang: string): string {
    const languages = this.appConfig.languages();
    if (languages.length > 0 && !languages.includes(lang)) {
      return languages[0];
    }
    return lang;
  }
}

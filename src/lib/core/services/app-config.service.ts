import { Injectable, inject, signal } from '@angular/core';
import { NiordInfoConfig, RootAreaSpec, NIORD_INFO_CONFIG } from '../../niord-info.config';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly config = inject(NIORD_INFO_CONFIG);

  readonly languages = signal<string[]>(this.config.languages);
  readonly timeZone = signal(this.config.timeZone);
  readonly executionMode = signal(this.config.executionMode);
  readonly wmsLayer = signal(this.config.wmsLayer);
  readonly rootAreaSpecs = signal<RootAreaSpec[]>(this.config.rootAreas);
  private readonly languageFlags = this.config.languageFlags;

  flagSrc(lang: string): string {
    return this.languageFlags?.[lang] ?? `assets/img/flags/${lang}.png`;
  }
}

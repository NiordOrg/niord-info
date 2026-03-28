import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageService } from '../../../core/services/language.service';
import { AppConfigService } from '../../../core/services/app-config.service';

@Component({
  selector: 'app-main-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, TranslocoPipe],
  template: `
    @if (modeText(); as mt) {
      <div class="execution-mode visible">{{ mt }}</div>
    }
    <nav class="view-mode-bar" role="navigation" aria-label="Main navigation">
      <div class="col-sm-8 col-md-6 col-lg-6 center" style="display: inline-block">
        <a class="view-mode-bar-btn" routerLink="/messages/details" routerLinkActive="active" role="link">
          <span class="bi bi-card-list"></span>
          <span class="view-mode-bar-txt">{{ 'MENU_DETAILS' | transloco }}</span>
        </a>
        <a class="view-mode-bar-btn" routerLink="/messages/table" routerLinkActive="active" role="link">
          <span class="bi bi-list-ul"></span>
          <span class="view-mode-bar-txt">{{ 'MENU_TABLE' | transloco }}</span>
        </a>
        <a class="view-mode-bar-btn" routerLink="/messages/map" routerLinkActive="active" role="link">
          <span class="bi bi-globe"></span>
          <span class="view-mode-bar-txt">{{ 'MENU_MAP' | transloco }}</span>
        </a>
        <a class="view-mode-bar-btn" routerLink="/publications" routerLinkActive="active" role="link">
          <span class="bi bi-download"></span>
          <span class="view-mode-bar-txt">{{ 'MENU_DOWNLOADS' | transloco }}</span>
        </a>
        <span class="view-mode-bar-btn">
          @for (lang of languages(); track lang) {
            <button
              type="button"
              class="btn btn-link p-0"
              (click)="setLanguage(lang)"
              [attr.aria-label]="'Switch to ' + lang"
            >
              <img
                [src]="flagSrc(lang)"
                class="language-flag"
                [class.active-language]="lang === currentLang()"
                [alt]="lang + ' flag'"
              />
            </button>
          }
        </span>
      </div>
    </nav>
  `,
})
export class MainMenuComponent {
  private readonly languageService = inject(LanguageService);
  private readonly appConfig = inject(AppConfigService);

  readonly languages = this.appConfig.languages;
  readonly currentLang = this.languageService.language;

  readonly modeText = computed(() => {
    const mode = this.appConfig.executionMode();
    if (mode === 'DEVELOPMENT') return 'DEV';
    if (mode === 'TEST') return 'TEST';
    return null;
  });

  flagSrc(lang: string): string {
    return this.appConfig.flagSrc(lang);
  }

  setLanguage(lang: string): void {
    this.languageService.setLanguage(lang);
  }
}

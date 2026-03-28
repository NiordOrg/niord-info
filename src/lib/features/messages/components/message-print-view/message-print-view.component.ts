import { Component, ChangeDetectionStrategy, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { formatInTimeZone } from 'date-fns-tz';
import { MessageDetailCardComponent } from '../message-detail-card/message-detail-card.component';
import { MessageAreaNameComponent } from '../message-detail-card/message-area-name.component';
import { LanguageService } from '../../../../core/services/language.service';
import { LocaleService } from '../../../../core/services/locale.service';
import { MessageService } from '../../../../core/services/message.service';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { MessageVo } from '../../../../core/models/message.model';

@Component({
  selector: 'app-message-print-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MessageDetailCardComponent, MessageAreaNameComponent],
  styles: `
    :host {
      display: block;
    }

    .print-body {
      font-size: 11px;
      font-family: Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #eee;
    }

    .message-details-list {
      margin: 10px auto;
      max-width: 820px;
      padding: 0 10px;
      font-size: 12px;
    }

    .message-search-text {
      font-size: 120%;
      margin-bottom: 5mm;
      padding: 3mm;
      color: white;
      background-color: #002D47;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .message-details-item {
      padding: 20px;
      margin: 5px 0;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    h4.message-area-heading {
      color: #8f2f7b;
      font-size: 20px;
      margin-top: 30px;
    }

    /* Hide interactive elements */
    :host ::ng-deep .bi-box-arrow-up-right,
    :host ::ng-deep .message-details-link,
    :host ::ng-deep .btn-link {
      all: unset;
      color: inherit;
      font: inherit;
      cursor: default;
      text-decoration: none;
    }

    :host ::ng-deep .clickable {
      cursor: default;
      text-decoration: none;
    }

    :host ::ng-deep .clickable:hover {
      text-decoration: none;
    }

    @media print {
      .print-body { background: white; }
      .message-search-text {
        background-color: #002D47 !important;
        color: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .message-details-item {
        background-color: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        page-break-inside: avoid;
        box-shadow: none;
        border: 1px solid #ddd;
      }
    }
  `,
  template: `
    <div class="print-body">
      <div class="message-details-list">
        <div class="message-search-text">{{ bannerText() }}</div>

        <table style="table-layout: fixed; width: 100%; max-width: 100%; overflow: hidden">
          @for (msg of messages(); track msg.id) {
            @if (msg.areaHeading) {
              <tr>
                <td style="border: none">
                  <h4 class="message-area-heading">
                    <app-message-area-name [area]="msg.areaHeading" [lineage]="false" />
                  </h4>
                </td>
              </tr>
            }
            <tr>
              <td style="border: none">
                <div class="message-details-item">
                  <app-message-detail-card [msg]="msg" format="details" />
                </div>
              </td>
            </tr>
          }
        </table>
      </div>
    </div>
  `,
})
export class MessagePrintViewComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly transloco = inject(TranslocoService);
  private readonly languageService = inject(LanguageService);
  private readonly messageService = inject(MessageService);
  private readonly localeService = inject(LocaleService);
  private readonly appConfig = inject(AppConfigService);

  readonly messages = signal<MessageVo[]>([]);
  readonly bannerText = signal('');

  ngOnInit(): void {
    const requestedLang = this.route.snapshot.queryParamMap.get('language')
      || this.route.snapshot.queryParamMap.get('lang');
    if (requestedLang) {
      this.languageService.setLanguage(requestedLang);
    }

    // Wait for translations to load before building banner and fetching messages.
    // Without this, transloco.translate() returns raw keys on the print route.
    this.transloco.selectTranslation().pipe(take(1)).subscribe(() => {
      this.buildBanner();
      this.fetchMessages();
    });
  }

  private buildBanner(): void {
    const lang = this.languageService.language();
    const locale = this.localeService.getDateFnsLocale(lang);
    const tz = this.appConfig.timeZone();
    const now = new Date();
    const dateFormat = this.transloco.translate('PRINT_DATE_FORMAT');
    const dateStr = formatInTimeZone(now, tz, dateFormat, { locale });
    this.bannerText.set(
      this.transloco.translate('PRINT_BANNER', {
        nm: this.transloco.translate('MENU_NM'),
        nw: this.transloco.translate('MENU_NW'),
        date: dateStr,
      }),
    );
  }

  private fetchMessages(): void {
    const params = this.route.snapshot.queryParams;
    const lang = this.languageService.language();
    const selectedSubAreaIds = this.route.snapshot.queryParamMap.getAll('subAreaId');

    let query = `language=${lang}`;
    if (params['mainType']) {
      const types = Array.isArray(params['mainType']) ? params['mainType'] : [params['mainType']];
      for (const t of types) query += `&mainType=${t}`;
    }
    if (params['areaId']) query += `&areaId=${params['areaId']}`;
    if (params['active']) query += `&active=${params['active']}`;
    if (params['publication']) query += `&publication=${params['publication']}`;
    if (params['messageId']) {
      // Single message mode
      this.messageService.getMessageDetails(params['messageId']).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: msg => {
          if (msg) {
            const sorted = this.messageService.sortDescs(msg, lang);
            this.messages.set([sorted]);
          }
        },
      });
      return;
    }

    this.http.get<MessageVo[]>(`/api/rest/public/v1/messages?${query}`).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: messages => {
        const sorted = messages.map(m => this.messageService.sortDescs(m, lang));
        const filtered = this.messageService.filterByAreaIds(sorted, selectedSubAreaIds);
        this.messageService.addAreaHeadings(filtered);
        this.messages.set(filtered);
      },
    });
  }
}

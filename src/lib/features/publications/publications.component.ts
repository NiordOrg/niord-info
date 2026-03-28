import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import dayjs, { Dayjs } from 'dayjs';
import { fromZonedTime } from 'date-fns-tz';
import { PublicationListComponent } from './components/publication-list/publication-list.component';
import { PublicationService } from '../../core/services/publication.service';
import { LanguageService } from '../../core/services/language.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { LocaleService } from '../../core/services/locale.service';
import { PublicationVo } from '../../core/models/publication.model';

@Component({
  selector: 'app-publications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, FormsModule, NgbNavModule, NgxDaterangepickerBootstrapDirective, PublicationListComponent],
  styles: `
    :host ::ng-deep .daterangepicker {
      font-size: 11px !important;
    }
    .publication-date-picker-wrapper {
      margin-right: 20px;
    }
    .publication-date-input-group {
      width: 240px;
      display: inline-flex;
    }
    .publication-date-input {
      font-size: 11px;
    }
  `,
  template: `
    <div class="publication-list">
      <div class="framed-tabs">
        <ul ngbNav #nav="ngbNav" [activeId]="1" class="nav-tabs">
          <li [ngbNavItem]="1">
            <button ngbNavLink>{{ 'ACTIVE_PUBLICATIONS' | transloco }}</button>
            <ng-template ngbNavContent>
              <app-publication-list [publications]="activePublications()" />
            </ng-template>
          </li>
          <li [ngbNavItem]="2">
            <button ngbNavLink>{{ 'HISTORICAL_PUBLICATIONS' | transloco }}</button>
            <ng-template ngbNavContent>
              <div class="publication-date-filter form-inline">
                <span>{{ 'CUSTOM_DATE_RANGE' | transloco }}</span>
                &nbsp;
                <span class="publication-date-picker-wrapper">
                  <span class="input-group publication-date-input-group">
                    <input
                      type="text"
                      class="form-control form-control-sm publication-date-input"
                      ngxDaterangepickerBootstrap
                      [linkedCalendars]="false"
                      [showWeekNumbers]="true"
                      [locale]="pickerLocale()"
                      [autoApply]="true"
                      [(ngModel)]="selectedRange"
                      (datesUpdated)="onDatesUpdated($any($event))"
                    />
                    <span class="input-group-text input-group-text-sm">
                      <i class="bi bi-calendar3"></i>
                    </span>
                  </span>
                </span>

                @for (range of ranges; track range.name) {
                  <button
                    type="button"
                    class="publication-date-btn"
                    (click)="setDateRange(range.start, range.end)"
                  >
                    {{ range.name }}
                  </button>
                }
              </div>

              <app-publication-list [publications]="historicalPublications()" />
            </ng-template>
          </li>
        </ul>
        <div [ngbNavOutlet]="nav"></div>
      </div>
    </div>
  `,
})
export class PublicationsComponent {
  private readonly publicationService = inject(PublicationService);
  private readonly languageService = inject(LanguageService);
  private readonly appConfig = inject(AppConfigService);
  private readonly localeService = inject(LocaleService);
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);
  private activeSub?: Subscription;
  private historicalSub?: Subscription;

  readonly activePublications = signal<PublicationVo[]>([]);
  readonly historicalPublications = signal<PublicationVo[]>([]);
  readonly startDate = signal('');
  readonly endDate = signal('');

  selectedRange: { startDate: Dayjs | null; endDate: Dayjs | null } = {
    startDate: null,
    endDate: null,
  };

  readonly pickerLocale = computed(() => {
    const lang = this.languageService.language();
    return {
      applyLabel: this.transloco.translate('TERM_APPLY'),
      cancelLabel: this.transloco.translate('TERM_CANCEL'),
      daysOfWeek: this.localeService.getDaysOfWeek(lang),
      monthNames: this.localeService.getMonthNames(lang),
      format: 'll',
      separator: ' - ',
      firstDay: 1,
    };
  });

  readonly ranges: { name: string; start: string; end: string }[];

  constructor() {
    const currentYear = new Date().getFullYear();
    this.ranges = Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - i;
      return {
        name: String(year),
        start: `${year}-01-01`,
        end: `${year}-12-31`,
      };
    });

    // Refresh active publications when language changes
    effect(() => {
      const lang = this.languageService.language();
      this.refreshActivePublications(lang);
    });

    // Refresh historical publications when dates or language change
    effect(() => {
      const start = this.startDate();
      const end = this.endDate();
      const lang = this.languageService.language();
      if (start && end) {
        this.refreshHistoricalPublications(lang, start, end);
      } else {
        this.historicalPublications.set([]);
      }
    });
  }

  // The ngxDaterangepickerBootstrap library types this as Object; cast to the actual shape
  onDatesUpdated(event: Record<string, Dayjs | null>): void {
    const start = event['startDate'];
    const end = event['endDate'];
    if (start && end) {
      this.startDate.set(start.format('YYYY-MM-DD'));
      this.endDate.set(end.format('YYYY-MM-DD'));
    }
  }

  setDateRange(start: string, end: string): void {
    this.selectedRange = {
      startDate: dayjs(start),
      endDate: dayjs(end),
    };
    this.startDate.set(start);
    this.endDate.set(end);
  }

  private refreshActivePublications(language: string): void {
    this.activeSub?.unsubscribe();
    this.activeSub = this.publicationService
      .search(`language=${language}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pubs) => {
          this.checkGroupByCategory(pubs);
          this.activePublications.set(pubs);
        },
      });
  }

  private refreshHistoricalPublications(language: string, start: string, end: string): void {
    let params = `language=${language}`;
    const tz = this.appConfig.timeZone();
    if (start) params += `&from=${this.startOfDayTimestamp(start, tz)}`;
    if (end) params += `&to=${this.endOfDayTimestamp(end, tz)}`;
    this.historicalSub?.unsubscribe();
    this.historicalSub = this.publicationService
      .search(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pubs) => {
          this.checkGroupByCategory(pubs);
          this.historicalPublications.set(pubs);
        },
      });
  }

  private startOfDayTimestamp(date: string, timeZone: string): number {
    return fromZonedTime(date, timeZone).getTime();
  }

  private endOfDayTimestamp(date: string, timeZone: string): number {
    const nextDay = dayjs(date).add(1, 'day').format('YYYY-MM-DD');
    return fromZonedTime(nextDay, timeZone).getTime() - 1;
  }

  private checkGroupByCategory(publications: PublicationVo[]): void {
    let lastCategoryId: string | undefined;
    for (const pub of publications) {
      if (pub.category && (!lastCategoryId || lastCategoryId !== pub.category.categoryId)) {
        lastCategoryId = pub.category.categoryId;
        pub.categoryHeading = pub.category;
      }
    }
  }
}

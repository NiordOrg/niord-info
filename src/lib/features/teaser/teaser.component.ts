import { Component, ChangeDetectionStrategy, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { MessageMapComponent } from '../messages/components/message-map/message-map.component';
import { LanguageService } from '../../core/services/language.service';
import { MessageService } from '../../core/services/message.service';
import { MessageVo } from '../../core/models/message.model';

@Component({
  selector: 'app-teaser',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, RouterLink, SafeHtmlPipe, MessageMapComponent],
  host: { class: 'teaser-body', style: 'display: block; position: fixed; top: 0; left: 0; right: 0; bottom: 0;' },
  template: `
    <a [routerLink]="['/messages/map']" target="_blank" style="display: block; width: 100%; height: 100%;">
      <app-message-map
        class="teaser-map"
        [messages]="messages()"
        [showNoPosMessages]="false"
        [fitExtent]="true"
        maxZoom="10"
        [readOnly]="true"
        osm="ArcGIS"
      >
      </app-message-map>
      <div class="teaser-banner" [innerHTML]="'TEASER_TEXT' | transloco | safeHtml"></div>
    </a>
  `,
})
export class TeaserComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly languageService = inject(LanguageService);
  private readonly messageService = inject(MessageService);

  readonly messages = signal<MessageVo[]>([]);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    const requestedLang = params['lang'];
    if (requestedLang) {
      this.languageService.setLanguage(requestedLang);
    }
    const lang = this.languageService.language();

    let url = `/api/rest/public/v1/messages?language=${lang}&mainType=NW&mainType=NM`;
    const area = params['area'];
    if (area) {
      url += `&areaId=${encodeURIComponent(area)}`;
    }

    this.http.get<MessageVo[]>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (msgs) => this.messages.set(msgs.map((m) => this.messageService.sortDescs(m, lang))),
    });
  }
}

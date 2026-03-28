import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { MessageVo, AreaVo, DescVo, FeatureVo } from '../models/message.model';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly http = inject(HttpClient);
  private readonly transloco = inject(TranslocoService);
  private readonly languageService = inject(LanguageService);

  getMessageDetails(id: string): Observable<MessageVo> {
    const lang = this.languageService.language();
    return this.http.get<MessageVo>(`/api/rest/public/v1/message/${encodeURIComponent(id)}?lang=${lang}`);
  }

  /** Returns the description record for the given language */
  desc(o: { descs?: DescVo[] } | undefined, lang?: string): DescVo | undefined {
    lang = lang || this.languageService.language();
    if (o?.descs && o.descs.length > 0) {
      const match = o.descs.find((d) => d.lang === lang);
      return match || o.descs[0];
    }
    return undefined;
  }

  /** Returns the root area for the given area */
  rootAreaOf(area: AreaVo | undefined): AreaVo | undefined {
    while (area?.parent) {
      area = area.parent;
    }
    return area;
  }

  /** Generate the HTML to display as a message ID badge */
  messageIdLabelHtml(msg: MessageVo | undefined, showStatus?: boolean): string {
    if (!msg) return '';

    let label = msg.shortId || '';
    const messageClass = msg.mainType === 'NW' ? 'label-message-nw' : 'label-message-nm';

    if (!label) {
      label = msg.type ? this.transloco.translate('TYPE_' + msg.type) + ' ' : '';
      label += msg.mainType ? this.transloco.translate('MAIN_TYPE_' + msg.mainType) : '';
    }
    label = `<span class="${messageClass}">${label}</span>`;

    if (
      showStatus &&
      ((msg.status === 'EXPIRED' && msg.type !== 'PERMANENT_NOTICE') || msg.status === 'CANCELLED')
    ) {
      label += `<span class="label-message-status">${this.transloco.translate('STATUS_' + msg.status)}</span>`;
    }

    let suffix = '';
    if (msg.type === 'TEMPORARY_NOTICE' || msg.type === 'PRELIMINARY_NOTICE') {
      suffix = msg.type === 'TEMPORARY_NOTICE' ? '&nbsp; (T)' : '&nbsp; (P)';
    }

    return label + suffix;
  }

  /** Sort all descs arrays so the given language comes first (matching DataFilter.lang behavior from old proxy) */
  sortDescs(msg: MessageVo, lang: string): MessageVo {
    const sort = <T extends { descs?: DescVo[] }>(item: T): T => {
      if (!item.descs || item.descs.length <= 1) return item;
      return { ...item, descs: [...item.descs].sort((a, b) => (a.lang === lang ? -1 : b.lang === lang ? 1 : 0)) };
    };
    return {
      ...sort(msg),
      parts: msg.parts?.map(sort),
      references: msg.references?.map(sort),
      attachments: msg.attachments?.map(sort),
      areas: msg.areas?.map(sort),
    };
  }

  /** Assigns `areaHeading` to the first message in each area group. */
  addAreaHeadings(messages: MessageVo[], maxLevels = 2): void {
    let lastAreaId: string | undefined;
    for (const msg of messages) {
      if (msg.areas && msg.areas.length > 0) {
        const areas: AreaVo[] = [];
        let current: AreaVo | undefined = msg.areas[0];
        while (current) {
          areas.unshift(current);
          current = current.parent;
        }
        if (areas.length > 0) {
          const area = areas[Math.min(areas.length - 1, maxLevels - 1)];
          if (!lastAreaId || area.id !== lastAreaId) {
            lastAreaId = area.id;
            msg.areaHeading = area;
          }
        }
      }
    }
  }

  /** Filters messages to those matching any selected area id in their area lineage. */
  filterByAreaIds(messages: MessageVo[], areaIds: string[]): MessageVo[] {
    if (areaIds.length === 0) return messages;

    const selectedIds = new Set(areaIds.map((areaId) => String(areaId)));
    return messages.filter((msg) => {
      if (!msg.areas) return false;
      return msg.areas.some((area) => {
        let current: AreaVo | undefined = area;
        while (current) {
          if (selectedIds.has(String(current.id))) return true;
          current = current.parent;
        }
        return false;
      });
    });
  }

  /** Returns the features associated with a message */
  featuresForMessage(msg: MessageVo | undefined): FeatureVo[] {
    const features: FeatureVo[] = [];
    if (msg?.parts) {
      for (const part of msg.parts) {
        if (part.geometry?.features?.length) {
          features.push(...part.geometry.features);
        }
      }
    }
    return features;
  }
}

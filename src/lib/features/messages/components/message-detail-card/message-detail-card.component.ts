import { Component, ChangeDetectionStrategy, input, output, inject, signal, computed, effect } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';
import { MessageIdBadgeComponent } from '../message-id-badge/message-id-badge.component';
import { MessageAttachmentComponent } from '../message-attachment/message-attachment.component';
import { MessageSourceComponent } from './message-source.component';
import { MessageService } from '../../../../core/services/message.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { MessageVo, AttachmentVo } from '../../../../core/models/message.model';

@Component({
  selector: 'app-message-detail-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, SafeHtmlPipe, MessageIdBadgeComponent, MessageAttachmentComponent, MessageSourceComponent],
  template: `
    <div style="width: 100%">
      @for (att of attachmentsAbove(); track att.path) {
        <div class="row">
          <div class="col-sm-12">
            <app-message-attachment [attachment]="att" />
          </div>
        </div>
      }

      @if (msg().originalInformation) {
        <div aria-label="Original information">&#9733;</div>
      }

      <div>
        <app-message-id-badge [msg]="msg()" [showStatus]="true" />
      </div>

      @if (msg().descs; as descs) {
        <div
          [class.clickable]="format() === 'list'"
          (click)="format() === 'list' ? onDetailsClick(msg().id) : null"
          (keydown.enter)="format() === 'list' ? onDetailsClick(msg().id) : null"
          [attr.role]="format() === 'list' ? 'button' : null"
          [attr.tabindex]="format() === 'list' ? 0 : null"
        >
          <span class="message-title">{{ descs[0].title }}</span>
          @if (format() === 'list') {
            <span class="bi bi-box-arrow-up-right message-details-link"></span>
          }
          @if (descs[0].lang !== language()) {
            <img [src]="appConfig.flagSrc(descs[0].lang)"
                 style="height: 12px; opacity: 0.5"
                 [alt]="descs[0].lang"
                 width="18" height="12" />
          }
        </div>
      }

      <table class="message-details-item-fields">
        @if (msg().references && msg().references!.length > 0) {
          <tr>
            <th>{{ 'FIELD_REFERENCES' | transloco }}</th>
            <td>
              @for (ref of msg().references!; track ref.messageId) {
                <div>
                  <button type="button" class="btn btn-link p-0" (click)="onDetailsClick(ref.messageId)">
                    {{ ref.messageId }}
                  </button>
                  @switch (ref.type) {
                    @case ('REPETITION') { {{ 'REF_REPETITION' | transloco }} }
                    @case ('REPETITION_NEW_TIME') { {{ 'REF_REPETITION_NEW_TIME' | transloco }} }
                    @case ('CANCELLATION') { {{ 'REF_CANCELLATION' | transloco }} }
                    @case ('UPDATE') { {{ 'REF_UPDATE' | transloco }} }
                  }
                  @if (ref.descs && ref.descs.length > 0 && ref.descs[0].description) {
                     - {{ ref.descs[0].description }}
                  }
                </div>
              }
            </td>
          </tr>
        }

        @if (msg().parts) {
          @for (part of msg().parts!; track $index) {
            <tr>
              <th>
                @if ($index === 0 || msg().parts![$index].type !== msg().parts![$index - 1].type) {
                  {{ 'PART_TYPE_' + part.type | transloco }}
                }
              </th>
              <td class="message-description">
                @if (part.descs && part.descs.length > 0) {
                  @if (part.descs[0].subject && !part.hideSubject) {
                    <div>
                      <strong>{{ part.descs[0].subject }}</strong>
                      @if (part.descs[0].lang !== language()) {
                        <img [src]="appConfig.flagSrc(part.descs[0].lang)"
                             style="height: 12px; opacity: 0.5"
                             [alt]="part.descs[0].lang"
                             width="18" height="12" />
                      }
                    </div>
                  }
                  @if (part.descs[0].details) {
                    <div [innerHTML]="part.descs[0].details | safeHtml"></div>
                  }
                }
              </td>
            </tr>
          }
        }

        @if (msg().attachments && msg().attachments!.length > 0) {
          <tr>
            <th>{{ 'FIELD_ATTACHMENTS' | transloco }}</th>
            <td>
              <div>
                <span class="bi bi-paperclip" style="color: darkgray"></span>
                @if (showAttachments()) {
                  <button type="button" class="btn btn-link p-0 clickable" (click)="showAttachments.set(false)">
                    {{ 'HIDE_ATTACHMENTS' | transloco }}
                  </button>
                } @else {
                  <button type="button" class="btn btn-link p-0 clickable" (click)="showAttachments.set(true)">
                    {{ 'SHOW_ATTACHMENTS' | transloco }}
                  </button>
                }
              </div>
              @if (showAttachments()) {
                @for (att of msg().attachments!; track att.path) {
                  <div style="margin-left: 20px">
                    <span class="bi bi-file-earmark"></span>
                    <a [href]="att.path" target="_blank" rel="noopener">{{ att.fileName }}</a>
                    @if (att.descs && att.descs.length > 0) {
                      <span> - {{ att.descs[0].caption }}</span>
                    }
                  </div>
                }
              }
            </td>
          </tr>
        }

        @if (msg().charts && msg().charts!.length > 0) {
          <tr>
            <th>{{ 'FIELD_CHARTS' | transloco }}</th>
            <td>{{ chartsText() }}</td>
          </tr>
        }

        @if (msg().descs && msg().descs![0].publication) {
          <tr>
            <th>{{ 'FIELD_PUBLICATION' | transloco }}</th>
            <td class="message-publication" [innerHTML]="msg().descs![0].publication | safeHtml"></td>
          </tr>
        }

        @if ((msg().descs && msg().descs![0].source) || msg().publishDateFrom) {
          <tr>
            <td colspan="2" class="text-end">
              (<app-message-source [msg]="msg()" />)
            </td>
          </tr>
        }
      </table>

      @for (att of attachmentsBelow(); track att.path) {
        <div class="row">
          <div class="col-sm-12">
            <app-message-attachment [attachment]="att" />
          </div>
        </div>
      }
    </div>
  `,
})
export class MessageDetailCardComponent {
  private readonly messageService = inject(MessageService);
  protected readonly appConfig = inject(AppConfigService);
  readonly language = inject(LanguageService).language;

  msg = input.required<MessageVo>();
  messages = input<MessageVo[]>([]);
  format = input<'list' | 'details'>('list');

  showDetails = output<string>();

  showAttachments = signal(false);

  attachmentsAbove = computed(() =>
    this.msg().attachments?.filter((a) => a.display === 'ABOVE') || [],
  );

  attachmentsBelow = computed(() =>
    this.msg().attachments?.filter((a) => a.display === 'BELOW') || [],
  );

  chartsText = computed(() => {
    const charts = this.msg().charts;
    if (!charts || charts.length === 0) return '';
    return charts
      .map((c) => c.chartNumber + (c.internationalNumber ? ` (INT ${c.internationalNumber})` : ''))
      .join(', ') + '.';
  });

  onDetailsClick(messageId: string): void {
    this.showDetails.emit(messageId);
  }
}

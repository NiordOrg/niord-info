import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageIdBadgeComponent } from '../message-id-badge/message-id-badge.component';
import { MessageAreaNameComponent } from '../message-detail-card/message-area-name.component';
import { MessageDetailsDialogComponent } from '../message-details-dialog/message-details-dialog.component';
import { LanguageService } from '../../../../core/services/language.service';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { MessagesComponent } from '../../messages.component';

@Component({
  selector: 'app-message-table-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MessageIdBadgeComponent, MessageAreaNameComponent],
  template: `
    <div class="message-details-list">
      <table style="width: 100%">
        @for (msg of parent.messages(); track msg.id) {
          @if (parent.areaHeadings().get(msg.id); as heading) {
            <tr>
              <td colspan="2" style="border: none">
                <h4 class="message-area-heading">
                  <app-message-area-name [area]="heading" [lineage]="false" />
                </h4>
              </td>
            </tr>
          }
          <tr class="message-table-item">
            <td style="vertical-align: middle; text-align: left; white-space: nowrap">
              <app-message-id-badge [msg]="msg" [showStatus]="true" />
            </td>
            <td style="vertical-align: middle; width: 100%">
              @if (msg.descs) {
                <span class="clickable" (click)="openDetails(msg.id)"
                      (keydown.enter)="openDetails(msg.id)" role="button" tabindex="0">
                  <span class="message-title">{{ msg.descs[0].title }}</span>
                  @if (msg.descs[0].lang !== language()) {
                    <img [src]="appConfig.flagSrc(msg.descs[0].lang)"
                         style="height: 12px; opacity: 0.5"
                         [alt]="msg.descs[0].lang"
                         width="18" height="12" />
                  }
                </span>
              }
            </td>
          </tr>
        }
      </table>
    </div>
  `,
})
export class MessageTableViewComponent {
  readonly parent = inject(MessagesComponent);
  private readonly modal = inject(NgbModal);
  protected readonly appConfig = inject(AppConfigService);
  readonly language = inject(LanguageService).language;

  openDetails(messageId: string): void {
    const ref = this.modal.open(MessageDetailsDialogComponent, { size: 'lg' });
    ref.componentInstance.messageId = messageId;
    ref.componentInstance.messageIds = this.parent.messages().map((m) => m.id);
  }
}

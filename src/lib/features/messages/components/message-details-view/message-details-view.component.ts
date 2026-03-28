import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageDetailCardComponent } from '../message-detail-card/message-detail-card.component';
import { MessageAreaNameComponent } from '../message-detail-card/message-area-name.component';
import { MessageDetailsDialogComponent } from '../message-details-dialog/message-details-dialog.component';
import { MessagesComponent } from '../../messages.component';

@Component({
  selector: 'app-message-details-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MessageDetailCardComponent, MessageAreaNameComponent],
  template: `
    <div class="message-details-list">
      <table style="width: 100%">
        @for (msg of parent.messages(); track msg.id) {
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
            <td>
              <div class="message-details-item">
                <app-message-detail-card
                  [msg]="msg"
                  [messages]="parent.messages()"
                  format="list"
                  (showDetails)="openDetails($event)"
                />
              </div>
            </td>
          </tr>
        }
      </table>
    </div>
  `,
})
export class MessageDetailsViewComponent implements OnInit {
  readonly parent = inject(MessagesComponent);
  private readonly modal = inject(NgbModal);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const messageId = this.route.snapshot.paramMap.get('messageId');
    if (messageId) {
      this.openDetails(messageId);
    }
  }

  openDetails(messageId: string): void {
    const ref = this.modal.open(MessageDetailsDialogComponent, { size: 'lg' });
    ref.componentInstance.messageId = messageId;
    ref.componentInstance.messageIds = this.parent.messages().map((m) => m.id);
  }
}

import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';
import { MessageService } from '../../../../core/services/message.service';
import { MessageVo } from '../../../../core/models/message.model';

@Component({
  selector: 'app-message-id-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SafeHtmlPipe],
  template: `<span [innerHTML]="badgeHtml() | safeHtml"></span>`,
})
export class MessageIdBadgeComponent {
  private readonly messageService = inject(MessageService);

  msg = input.required<MessageVo>();
  showStatus = input(false);

  badgeHtml(): string {
    return this.messageService.messageIdLabelHtml(this.msg(), this.showStatus());
  }
}

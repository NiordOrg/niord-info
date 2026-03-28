import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { AttachmentVo } from '../../../../core/models/message.model';

@Component({
  selector: 'app-message-attachment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="attachment">
      <div>
        @if (sourceType() === 'image') {
          <img [src]="attachment().path" [style]="sourceStyle()" [alt]="caption()" />
        } @else {
          <video controls [style]="sourceStyle()">
            <source [src]="attachment().path" [type]="attachment().type" />
          </video>
        }
      </div>
      @if (caption(); as cap) {
        <div class="attachment-label"><i>{{ cap }}</i></div>
      }
    </div>
  `,
})
export class MessageAttachmentComponent {
  attachment = input.required<AttachmentVo>();

  sourceType = computed(() => {
    const att = this.attachment();
    return att.type?.startsWith('video') ? 'video' : 'image';
  });

  sourceStyle = computed(() => {
    const att = this.attachment();
    const style: Record<string, string> = { 'max-width': '100%' };
    if (att.width) style['width'] = att.width;
    if (att.height) style['height'] = att.height;
    return style;
  });

  caption = computed(() => {
    const att = this.attachment();
    return att.descs?.[0]?.caption || '';
  });
}

import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MessageMapComponent } from '../message-map/message-map.component';
import { MessagesComponent } from '../../messages.component';

@Component({
  selector: 'app-message-map-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MessageMapComponent],
  template: `
    <div class="message-list-map">
      <app-message-map
        class="message-map"
        [messages]="parent.messages()"
        [showNoPosMessages]="true"
        [fitExtent]="true"
        [rootArea]="parent.rootArea()"
        maxZoom="10"
      />
    </div>
  `,
})
export class MessageMapViewComponent {
  readonly parent = inject(MessagesComponent);
}

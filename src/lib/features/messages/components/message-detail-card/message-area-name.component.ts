import { Component, ChangeDetectionStrategy, input, inject, computed } from '@angular/core';
import { AreaVo } from '../../../../core/models/message.model';
import { MessageService } from '../../../../core/services/message.service';

@Component({
  selector: 'app-message-area-name',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ areaName() }}`,
})
export class MessageAreaNameComponent {
  private readonly messageService = inject(MessageService);

  area = input.required<AreaVo>();
  lineage = input(true);
  divider = input(' - ');

  areaName = computed(() => {
    let result = '';
    let current: AreaVo | undefined = this.area();
    const div = this.divider();

    while (current) {
      const desc = this.messageService.desc(current);
      const name = desc?.name || '';
      result = name + (result.length > 0 && name.length > 0 ? div : '') + result;
      current = this.lineage() ? current.parent : undefined;
    }
    return result;
  });
}

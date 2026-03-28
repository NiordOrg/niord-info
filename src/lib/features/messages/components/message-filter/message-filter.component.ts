import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { AreaVo } from '../../../../core/models/message.model';
import { MessageAreaNameComponent } from '../message-detail-card/message-area-name.component';

@Component({
  selector: 'app-message-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, MessageAreaNameComponent],
  template: `
    <div class="filter-bars">
      <div class="filter-bar">
        <div class="col-12 center filter-bar-btns">
          <span
            class="filter-bar-btn"
            [class.filter-bar-btn-selected]="mainTypes().NW"
            (click)="toggleMainType('NW')"
            role="button"
            tabindex="0"
            (keydown.enter)="toggleMainType('NW')"
          >{{ 'MENU_NW' | transloco }}</span>
          <span
            class="filter-bar-btn"
            [class.filter-bar-btn-selected]="mainTypes().NM"
            (click)="toggleMainType('NM')"
            role="button"
            tabindex="0"
            (keydown.enter)="toggleMainType('NM')"
          >{{ 'MENU_NM' | transloco }}</span>

          <span class="filter-bar-separator"></span>

          <span
            class="filter-bar-btn"
            [class.filter-bar-btn-selected]="activeNow()"
            (click)="activeNowChange.emit()"
            role="button"
            tabindex="0"
            (keydown.enter)="activeNowChange.emit()"
          >{{ 'ACTIVE_NOW' | transloco }}</span>

          <span class="filter-bar-separator"></span>

          <span class="filter-bar-btn" (click)="printRequested.emit()" role="button" tabindex="0"
                (keydown.enter)="printRequested.emit()">
            <span class="bi bi-printer"></span>
            {{ 'MENU_PRINT' | transloco }}
          </span>
        </div>
      </div>

      @if (areaRoots().length > 0) {
        <div class="filter-bar">
          <div class="col-12 center filter-bar-btns">
            @if (areaRoots().length > 1) {
              @for (area of areaRoots(); track area.id) {
                <span
                  class="filter-bar-btn"
                  [class.filter-bar-btn-selected]="rootArea()?.id === area.id"
                  (click)="rootAreaChange.emit(area)"
                  role="button"
                  tabindex="0"
                  (keydown.enter)="rootAreaChange.emit(area)"
                >
                  <app-message-area-name [area]="area" [lineage]="false" />
                </span>
              }
            }

            @if (areaRoots().length > 1 && rootArea() && subAreas().length > 0) {
              <span class="filter-bar-separator"></span>
            }

            @if (rootArea() && subAreas().length > 0) {
              @for (area of subAreas(); track area.id) {
                <span
                  class="filter-bar-btn"
                  [class.filter-bar-btn-selected]="area.selected"
                  (click)="subAreaToggle.emit(area)"
                  role="button"
                  tabindex="0"
                  (keydown.enter)="subAreaToggle.emit(area)"
                >
                  <app-message-area-name [area]="area" [lineage]="false" />
                </span>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class MessageFilterComponent {
  areaRoots = input<AreaVo[]>([]);
  rootArea = input<AreaVo | undefined>(undefined);
  subAreas = input<AreaVo[]>([]);
  mainTypes = input<{ NW: boolean; NM: boolean }>({ NW: true, NM: true });
  activeNow = input(false);

  rootAreaChange = output<AreaVo>();
  mainTypesChange = output<{ NW: boolean; NM: boolean }>();
  activeNowChange = output<void>();
  subAreaToggle = output<AreaVo>();
  printRequested = output<void>();

  toggleMainType(type: 'NW' | 'NM'): void {
    const current = this.mainTypes();
    this.mainTypesChange.emit({ ...current, [type]: !current[type] });
  }
}

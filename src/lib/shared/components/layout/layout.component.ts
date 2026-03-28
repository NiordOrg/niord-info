import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MainMenuComponent } from '../main-menu/main-menu.component';
import { DefaultFooterComponent } from '../footer/default-footer.component';
import { NIORD_INFO_CONFIG } from '../../../niord-info.config';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MainMenuComponent, NgComponentOutlet],
  template: `
    <app-main-menu />
    <router-outlet />
    <ng-container [ngComponentOutlet]="footerComponent" />
  `,
})
export class LayoutComponent {
  readonly footerComponent = inject(NIORD_INFO_CONFIG).footerComponent ?? DefaultFooterComponent;
}

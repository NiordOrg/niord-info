import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-default-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer container-fluid">
      <div class="row">
        <div class="col text-center" style="padding-top: 7px">Niord &copy; {{ year }}</div>
      </div>
    </footer>
  `,
})
export class DefaultFooterComponent {
  readonly year = new Date().getFullYear();
}

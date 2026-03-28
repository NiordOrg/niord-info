import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PublicationVo } from '../../../../core/models/publication.model';

@Component({
  selector: 'app-publication-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoPipe],
  template: `
    <table style="width: 100%">
      @for (pub of publications(); track pub.publicationId) {
        @if (pub.categoryHeading) {
          <tr>
            <td colspan="3" style="border: none">
              <h4 class="publication-category-heading">
                {{ pub.categoryHeading.descs?.[0]?.name }}
              </h4>
            </td>
          </tr>
        }
        <tr class="publication-table-item">
          <td style="vertical-align: middle; text-align: left; white-space: nowrap">
            <span class="bi bi-book-fill"></span>
            {{ pub.descs?.[0]?.title }}
          </td>
          <td style="vertical-align: middle; width: 100px">
            @if (pub.descs?.[0]?.link) {
              <a [href]="pub.descs![0].link" target="_blank" rel="noopener">
                <span class="bi bi-download"></span>
                {{ 'OPEN_PUBLICATION' | transloco }}
              </a>
            }
          </td>
          <td style="vertical-align: middle; width: 100px">
            @if (pub.type === 'MESSAGE_REPORT') {
              <a [routerLink]="['/messages/details']" [queryParams]="{ publicationId: pub.publicationId }">
                <span class="bi bi-list-ul"></span>
                {{ 'BROWSE_PUBLICATION' | transloco }}
              </a>
            }
          </td>
        </tr>
      }
    </table>
  `,
})
export class PublicationListComponent {
  publications = input<PublicationVo[]>([]);
}

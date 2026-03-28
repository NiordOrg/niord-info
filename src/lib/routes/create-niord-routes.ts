import { Routes } from '@angular/router';
import { LayoutComponent } from '../shared/components/layout/layout.component';

export function createNiordRoutes(): Routes {
  return [
    { path: '', redirectTo: 'messages/details', pathMatch: 'full' },
    {
      path: 'messages/print',
      loadComponent: () =>
        import('../features/messages/components/message-print-view/message-print-view.component').then(
          m => m.MessagePrintViewComponent,
        ),
    },
    {
      path: '',
      component: LayoutComponent,
      children: [
        {
          path: 'messages',
          loadChildren: () =>
            import('../features/messages/messages.routes').then(m => m.messagesRoutes),
        },
        {
          path: 'publications',
          loadComponent: () =>
            import('../features/publications/publications.component').then(
              m => m.PublicationsComponent,
            ),
        },
      ],
    },
    {
      path: 'teaser',
      loadComponent: () =>
        import('../features/teaser/teaser.component').then(m => m.TeaserComponent),
    },
    { path: '**', redirectTo: 'messages/details' },
  ];
}

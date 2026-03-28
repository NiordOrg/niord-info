import { Routes } from '@angular/router';
import { MessagesComponent } from './messages.component';

export const messagesRoutes: Routes = [
  {
    path: '',
    component: MessagesComponent,
    children: [
      { path: '', redirectTo: 'details', pathMatch: 'full' },
      {
        path: 'details',
        loadComponent: () =>
          import('./components/message-details-view/message-details-view.component').then(
            (m) => m.MessageDetailsViewComponent,
          ),
      },
      {
        path: 'details/message/:messageId',
        loadComponent: () =>
          import('./components/message-details-view/message-details-view.component').then(
            (m) => m.MessageDetailsViewComponent,
          ),
      },
      {
        path: 'table',
        loadComponent: () =>
          import('./components/message-table-view/message-table-view.component').then(
            (m) => m.MessageTableViewComponent,
          ),
      },
      {
        path: 'map',
        loadComponent: () =>
          import('./components/message-map-view/message-map-view.component').then(
            (m) => m.MessageMapViewComponent,
          ),
      },
    ],
  },
];

import { Routes } from '@angular/router';

export const publicationsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./publications.component').then((m) => m.PublicationsComponent),
  },
];

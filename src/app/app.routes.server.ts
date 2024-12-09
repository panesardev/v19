import { RenderMode, ServerRoute } from '@angular/ssr';

export const routes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

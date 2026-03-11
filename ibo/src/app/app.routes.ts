import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'new-game',
    loadComponent: () => import('./features/new-game/new-game.component').then(m => m.NewGameComponent),
  },
  {
    path: 'game/:id',
    loadComponent: () => import('./features/game/game.component').then(m => m.GameComponent),
  },
  { path: '**', redirectTo: '' },
];

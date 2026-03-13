import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'calendar', pathMatch: 'full' },
  { path: 'calendar', loadComponent: () => import('./components/calendar/calendar').then(m => m.Calendar) },
  { path: 'day/:date', loadComponent: () => import('./components/day-detail/day-detail').then(m => m.DayDetail) },
  { path: 'ingredients', loadComponent: () => import('./components/ingredients/ingredients').then(m => m.Ingredients) },
  { path: 'meals', loadComponent: () => import('./components/meals/meals').then(m => m.Meals) },
  { path: 'settings', loadComponent: () => import('./components/settings/settings').then(m => m.Settings) },
  { path: 'profiles', loadComponent: () => import('./components/profiles/profiles').then(m => m.Profiles) },
];

import { Routes } from '@angular/router';
import { MapComponent } from '@shared/components/map/map.component';

export const routes: Routes = [
  { path: '', component: MapComponent },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];

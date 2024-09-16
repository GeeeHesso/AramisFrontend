import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { LoginComponent } from '@shared/components/login/login.component';
import { MapComponent } from '@shared/components/map/map.component';

export const routes: Routes = [
  { path: '', component: MapComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  {
    path: '**',
    redirectTo: '/map',
    pathMatch: 'full',
  },
];

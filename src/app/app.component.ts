import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
})
export class AppComponent implements OnInit {
  name = 'Angular';

  constructor(private _authService: AuthService, private router: Router) {}

  ngOnInit() {}
}

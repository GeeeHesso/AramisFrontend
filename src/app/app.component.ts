import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Inject,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { LINE_220KV_COLOR, LINE_380KV_COLOR } from '@core/core.const';
import { API_LOADING } from '@core/models/base.const';
import { MapService } from '@core/services/map/map.service';
import { ParametersComponent } from '@shared/components/parameters/parameters.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,

    // Material
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBar,

    // Component
    ParametersComponent,
  ],
})
export class AppComponent implements AfterViewInit {
  line380kVColor = LINE_380KV_COLOR;
  line220kVColor = LINE_220KV_COLOR;

  screenWidth!: number;
  private screenWidth$ = new BehaviorSubject<number>(window.innerWidth);
  @ViewChild('sidenav')
  sidenav!: MatSidenav;
  @HostListener('window:resize', ['$event'])
  onResize(event: { target: { innerWidth: number } }) {
    this.screenWidth$.next(event.target.innerWidth);
  }

  constructor(
    public mapService: MapService,

    @Inject(API_LOADING)
    public apiLoading$: BehaviorSubject<boolean>
  ) {
    this.apiLoading$.next(true);
  }

  ngOnInit() {
    this.screenWidth$.subscribe((width) => {
      this.screenWidth = width;
    });
  }

  ngAfterViewInit(): void {
    // Need map to be initialized before anything else
    this.mapService.initMaps();
  }

  // Reload maps to avoid grey band on the side
  protected toggleSidenav(): void {
    this.sidenav.toggle().then(() => {
      this.mapService.mapTop.invalidateSize();
      this.mapService.mapBottom.invalidateSize();
    });
  }
}

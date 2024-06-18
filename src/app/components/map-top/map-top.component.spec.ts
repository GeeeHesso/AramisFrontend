import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapTopComponent } from './map-top.component';

describe('MapTopComponent', () => {
  let component: MapTopComponent;
  let fixture: ComponentFixture<MapTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapTopComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

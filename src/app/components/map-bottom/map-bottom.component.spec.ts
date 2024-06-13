import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapBottomComponent } from './map-bottom.component';

describe('MapBottomComponent', () => {
  let component: MapBottomComponent;
  let fixture: ComponentFixture<MapBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapBottomComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

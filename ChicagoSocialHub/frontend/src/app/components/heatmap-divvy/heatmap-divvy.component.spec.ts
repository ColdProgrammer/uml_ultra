import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatmapDivvyComponent } from './heatmap-divvy.component';

describe('HeatmapDivvyComponent', () => {
  let component: HeatmapDivvyComponent;
  let fixture: ComponentFixture<HeatmapDivvyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatmapDivvyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatmapDivvyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

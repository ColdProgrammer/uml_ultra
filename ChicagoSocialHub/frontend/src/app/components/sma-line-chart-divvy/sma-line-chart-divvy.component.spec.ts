import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmaLineChartDivvyComponent } from './sma-line-chart-divvy.component';

describe('SmaLineChartDivvyComponent', () => {
  let component: SmaLineChartDivvyComponent;
  let fixture: ComponentFixture<SmaLineChartDivvyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmaLineChartDivvyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmaLineChartDivvyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

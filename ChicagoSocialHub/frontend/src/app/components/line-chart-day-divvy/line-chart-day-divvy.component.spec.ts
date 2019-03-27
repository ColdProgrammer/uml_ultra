import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartDayDivvyComponent } from './line-chart-day-divvy.component';

describe('LineChartDayDivvyComponent', () => {
  let component: LineChartDayDivvyComponent;
  let fixture: ComponentFixture<LineChartDayDivvyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChartDayDivvyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartDayDivvyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

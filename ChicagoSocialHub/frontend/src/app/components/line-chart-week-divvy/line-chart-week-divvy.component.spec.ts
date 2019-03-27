import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartWeekDivvyComponent } from './line-chart-week-divvy.component';

describe('LineChartWeekDivvyComponent', () => {
  let component: LineChartWeekDivvyComponent;
  let fixture: ComponentFixture<LineChartWeekDivvyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChartWeekDivvyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartWeekDivvyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartDivvyComponent } from './line-chart-divvy.component';

describe('LineChartDivvyComponent', () => {
  let component: LineChartDivvyComponent;
  let fixture: ComponentFixture<LineChartDivvyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChartDivvyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartDivvyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

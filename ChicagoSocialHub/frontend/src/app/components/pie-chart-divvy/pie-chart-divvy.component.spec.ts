import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PieChartDivvyComponent } from './pie-chart-divvy.component';

describe('PieChartDivvyComponent', () => {
  let component: PieChartDivvyComponent;
  let fixture: ComponentFixture<PieChartDivvyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PieChartDivvyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PieChartDivvyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

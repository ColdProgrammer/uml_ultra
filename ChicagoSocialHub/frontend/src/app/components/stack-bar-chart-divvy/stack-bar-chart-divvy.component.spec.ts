import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackBarChartDivvyComponent } from './stack-bar-chart-divvy.component';

describe('StackBarChartDivvyComponent', () => {
  let component: StackBarChartDivvyComponent;
  let fixture: ComponentFixture<StackBarChartDivvyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackBarChartDivvyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackBarChartDivvyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

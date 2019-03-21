import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartYelpComponent } from './bar-chart-yelp.component';

describe('BarChartYelpComponent', () => {
  let component: BarChartYelpComponent;
  let fixture: ComponentFixture<BarChartYelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarChartYelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarChartYelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

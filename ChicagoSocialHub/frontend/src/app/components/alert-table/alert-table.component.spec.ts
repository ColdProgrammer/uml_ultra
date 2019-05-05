import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertTableComponent } from './alert-table.component';

describe('AlertTableComponent', () => {
  let component: AlertTableComponent;
  let fixture: ComponentFixture<AlertTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DasboardDisplayComponent } from './dasboard-display.component';

describe('DasboardDisplayComponent', () => {
  let component: DasboardDisplayComponent;
  let fixture: ComponentFixture<DasboardDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DasboardDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DasboardDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

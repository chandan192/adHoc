import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomReportComponent } from './add-custom-report.component';

describe('AddCustomReportComponent', () => {
  let component: AddCustomReportComponent;
  let fixture: ComponentFixture<AddCustomReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCustomReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCustomReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

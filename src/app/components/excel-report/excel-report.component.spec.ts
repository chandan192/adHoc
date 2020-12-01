import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelReportComponent } from './excel-report.component';

describe('ExcelReportComponent', () => {
  let component: ExcelReportComponent;
  let fixture: ComponentFixture<ExcelReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExcelReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

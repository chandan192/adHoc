import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SaveCompleteEventArgs, SaveOptions, SpreadsheetComponent } from '@syncfusion/ej2-angular-spreadsheet';
import { SelectItem, TreeNode } from 'primeng/api';
import SpreadsheetUtils, { Report } from './../../interfaces/spreadsheet-util';
import { NvhttpService } from './../../services/nvhttp.service';
import * as moment from 'moment';
import 'moment-timezone';
import { AppComponent } from './../../app.component';
import { ConfirmationService } from 'primeng/api';
import { BroadcastService } from 'src/app/services/broadcast.service';

@Component({
  selector: 'app-excel-report',
  templateUrl: './excel-report.component.html',
  styleUrls: ['./excel-report.component.css'],
  providers: [ConfirmationService]
})

export class ExcelReportComponent implements OnInit, AfterViewInit {

  @ViewChild('default', { static: false })
  public spreadsheetObj: SpreadsheetComponent;
  public data: any[] = [];
  // public openUrl = 'https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/open';
  public saveUrl = 'https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/save';
  opened = true;
  reports: TreeNode[] = [];
  display: boolean;
  templateReports: SelectItem[] = [];
  selectedTemplateReport: any;
  displayTemplateReport: boolean;
  displayADHOCReport: boolean;
  XLSTemplate: boolean;
  selectedReport: Report;
  selectedReportColumns: string[] = [];
  showRename: boolean;  // to show the rename input box
  reportName = 'Untitled_Spreadsheet';
  displayPreview: boolean;
  lastTime: SelectItem[] = [
    { label: 'Hour(s)', value: 'hours' },
    { label: 'Day(s)', value: 'days' },
    { label: 'Week(s)', value: 'weeks' },
    { label: 'Month(s)', value: 'months' },
    { label: 'Year(s)', value: 'years' }
  ];
  form: FormGroup;
  maxDate: Date;

  constructor(private http: NvhttpService, private router: Router, private confirmationService: ConfirmationService, private trigger: BroadcastService) {
    this.clearReport();
  }

  clearReport() {
    const time = new Date().getTime();
    const d = new Date(moment.tz(time, AppComponent.config.timeZone).format('MM/DD/YYYY HH:mm:ss'));
    const startT: Date = new Date(d.toDateString() + ' 00:00:00');
    const endT: Date = new Date(d.toDateString() + ' 23:59:00');
    this.maxDate = new Date(d.toDateString() + ' 23:59:00');

    this.form = new FormGroup({
      timeFilter: new FormControl('true'),
      lastTime: new FormControl('days'),
      lastValue: new FormControl(1),
      stime: new FormControl(startT),
      etime: new FormControl(endT),
    });
  }

  ngOnInit() {
    // get report list
    this.loadPanelMenuData();


    this.trigger.on('fileClicked').subscribe(() => {
      let id = this.spreadsheetObj.element.id;

      setTimeout(() => {
        document.getElementById(id + '_Open').style.display = 'none';
        document.getElementById(id + '_Save_As').classList.remove('e-disabled');

        document.getElementById(id + '_Save_As').addEventListener('mouseenter', () => {
          setTimeout(() => {

            document.getElementById(id + '_Xlsx').children[0].addEventListener('click', (e: MouseEvent) => {
              this.saveReport('Xlsx');
              e.stopPropagation();
            });

            document.getElementById(id + '_Xls').children[0].addEventListener('click', (e: MouseEvent) => {
              e.stopPropagation();
              this.saveReport('Xls');
            })
            document.getElementById(id + '_Csv').style.display = 'none';
          });
        });

      });
    });

  }

  ngAfterViewInit() {
    this.setFileOptions();
  }

  setFileOptions() {
    setTimeout(() => {
      let id = this.spreadsheetObj.element.id;
      console.log('Workbook id : ', id);

      document.getElementById(id + '_File').addEventListener('click', () => {
        this.trigger.broadcast('fileClicked');
      });


    }, 1000);
  }

  loadPanelMenuData() {
    this.http.getGeneralReport().subscribe((response: any) => {

      let temp: any[] = response.standard;

      const userName = sessionStorage.getItem('sesLoginName');
      if (response.hasOwnProperty(userName)) {
        temp = temp.concat(response[userName]);
      }

      this.reports = this.showPanelMenu(temp);

    });
  }

  showPanelMenu(jsonData) {
    const panelItems: TreeNode[] = [];
    let items: TreeNode[];
    const group = [];
    // Removing duplicate group name from the record
    for (const i of jsonData) {
      if (group.indexOf(i.group) === -1) {
        group.push(i.group);
      }
    }

    // pushing the group and name in the panelItems
    // the group becomes heading and name becomes sub heading under that group
    for (const i of group) {
      panelItems.push({
        label: i,
        expandedIcon: 'fa fa-folder-open',
        collapsedIcon: 'fa fa-folder',
        children: []
      });
    }

    for (let i = 0; i < group.length; i++) {
      items = [];
      panelItems[i].children = items;

      for (const j of jsonData) {
        if (group[i] === j.group) {
          items.push({
            label: j.name,
            icon: 'fa fa-file',
            data: j,
          });
        }
      }
    }

    return panelItems;
  }

  getReportDetails(data: any): Report {
    let report;
    if (data.hasOwnProperty('columns')) {
      const headers = this.getColumns(data.columns);
      report = new Report(data.name, headers, 5, headers.length);

    } else if (data.hasOwnProperty('columnDetails')) {
      const headers = this.getColumns(data.columnDetails);
      report = new Report(data.name, headers, 5, headers.length);

    }

    return report;


  }

  dropReport(report: Report) {
    // get the selected cell index

    console.log('SpreadSheet - :', this.spreadsheetObj);
    const activeCell = this.spreadsheetObj.getActiveSheet().activeCell;
    console.log({ activeCell });

    if (!activeCell) {
      alert('No cell selected');
    } else {
      this.insertReport(activeCell, report);
    }
  }

  insertReport(startCell: string, report: Report) {
    // calculate header range.
    const range = SpreadsheetUtils.getReportRange(startCell, report.row, report.column);
    console.log({ range });

    // populate header name too.
    for (let i = 0; i < report.column; i++) {
      this.spreadsheetObj.setValueRowCol(this.spreadsheetObj.activeSheetIndex, report.headers[i], range.startRowIndex, range.startColIndex + i);
      this.spreadsheetObj.setColWidth(report.headers[i].length * 10, (range.startColIndex - 1) + i, this.spreadsheetObj.activeSheetIndex);
    }

    // populating report.
    this.spreadsheetObj.cellFormat({ backgroundColor: '#336B87', color: '#FCF6F5', fontSize: '12pt', fontWeight: 'bold', textAlign: 'center' }, range.headerRange);

    // set border.
    this.spreadsheetObj.setBorder({ border: '1px solid grey' }, range.range, 'Inner');
    this.spreadsheetObj.setBorder({ border: '1px solid grey' }, range.range, 'Outer');

    setTimeout(() => {
      this.spreadsheetObj.refresh(false);
      this.setFileOptions();
    }, 100);
  }

  getColumns(columns: any[]): any[] {
    const columnsArr = [];

    for (const i of columns) {
      columnsArr.push(i.name);
    }

    console.log('Columns ------', columnsArr);

    return columnsArr;
  }

  closeADHOCDialog(e: any) {
    console.log({ e });
    this.displayADHOCReport = false;
    this.XLSTemplate = false;

    this.dropReport(this.getReportDetails(e));
    //  refresh the report list
    this.loadPanelMenuData();


  }

  showADHOCDialog() {
    this.displayADHOCReport = true;
    this.XLSTemplate = true;

  }

  checkReportName() {
    if (this.reportName.trim() === '') {
      this.reportName = 'Untitled_Spreadsheet';
    }

    this.showRename = false;
  }

  saveReport(type): void {
    const url = this.http.getRequestUrl('/netvision/rest/webapi/adhocreporttemplateexport?access_token=563e412ab7f5a282c15ae5de1732bfd1');
    const fileName = this.reportName + '_' + new Date().getTime();
    const saveOptions: SaveOptions = { url, fileName, saveType: type };

    this.spreadsheetObj.save(saveOptions);

    document.getElementById('control-section').click();


    // let jsonObject = this.spreadsheetObj.saveAsJson();
    //   jsonObject.__zone_symbol__value.jsonObject.Workbook
  }



  newWorkbook() {
    this.confirmationService.confirm({
      message: ' Are you sure you want to destroy the current workbook without saving and create a new workbook?',
      accept: () => {
        this.spreadsheetObj.sheets.length = 0;
        this.spreadsheetObj.createSheet();
        //dialogInst_1.hide();
        this.spreadsheetObj.activeSheetIndex = this.spreadsheetObj.sheets.length - 1;
        // this.spreadsheetObj.notify(refreshSheetTabs, {});
        // this.spreadsheetObj.notify(sheetsDestroyed, {});
        this.spreadsheetObj.renderModule.refreshSheet();
      }
    });
  }

  showTemplateReports() {
    this.displayTemplateReport = true;
    this.http.getTeplateReportList().subscribe((res: any[]) => {
      console.log('template report list - :', res);

      for (const i of res) {
        const report: SelectItem = { label: i.split('.')[0], value: i.split('.')[0] };
        this.templateReports.push(report);
      }
    },
      err => {
        alert('Failed to get the template report list.');
      });
  }

  getReportListDetail(e) {
    console.log('selected Report - :', e);

    this.http.getTemplateReportDetail(e.value).subscribe((res: any) => {
      console.log('selected report detail - ', res);
      const openObject = {
        file: {
          Workbook: res
        }
      };
      this.spreadsheetObj.openFromJson(openObject);
    });
  }

  previewReport(e: MouseEvent, report) {
    this.displayPreview = true;

  }

  deleteReport(e: MouseEvent, report) {
    e.stopPropagation();
    alert('Report deleted');
  }

  onSubmit() {
    console.log(this.form.value);
  }

  nodeSelect(e) {
    console.log(e);
    // disable parent node selection
    if (e.node.parent) {
      const data = e.node.data;

      if (data.hasOwnProperty('columns')) {
        this.dropReport(this.getReportDetails(data));

      } else if (data.hasOwnProperty('columnDetails')) {
        this.dropReport(this.getReportDetails(data));
      }

    }
  }

}

import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Route, Router } from '@angular/router';
import { ClearOptions, OpenOptions, SaveOptions, SpreadsheetComponent } from '@syncfusion/ej2-angular-spreadsheet';
import { MenuItem, SelectItem } from 'primeng/api';
import { stringify } from 'querystring';
import SpreadsheetUtils, { Report } from 'src/app/interfaces/spreadsheet-util';
import { NvhttpService } from 'src/app/services/nvhttp.service';

@Component({
  selector: 'app-excelsheet',
  templateUrl: './excelsheet.component.html',
  styleUrls: ['./excelsheet.component.css']
})
export class ExcelsheetComponent implements OnInit {
  @ViewChild('default', { static: false })
  public spreadsheetObj: SpreadsheetComponent;
  public data: any[] = [];
  // public openUrl = 'https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/open';
  // public saveUrl = 'https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/save';
  opened = true;
  reports: MenuItem[] = [];
  display: boolean;
  templateReports: SelectItem[] = [];
  selectedTemplateReport: any;
  displayTemplateReport: boolean;
  displayADHOCReport: boolean;
  XLSTemplate: boolean;
  selectedReport: Report;
  selectedReportColumns: string[] = [];
  showRename: boolean;  // to show the rename input box
  reportName = 'Untitled Spreadsheet';

  constructor(private http: NvhttpService, private router: Router) { }

  ngOnInit() {
    // get report list
    this.http.getGeneralReport().subscribe((response: any) => {
      console.log(response);

      // get group from the report list
      this.reports = this.showPanelMenu(response.standard);
      console.log('reports -----', this.reports);
    });

  }

  showPanelMenu(jsonData) {
    const panelItems: MenuItem[] = [];
    let items: any;
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
        items: [] as MenuItem[],
      });
    }

    for (let i = 0; i < group.length; i++) {
      items = [] as MenuItem[];
      panelItems[i].items = items;

      for (const j of jsonData) {
        if (group[i] === j.group) {
          items.push({
            label: j.name,
            data: j,
            command: (event: any) => {
              console.log('event.item.data - ', event.item.data);
              console.log(this.spreadsheetObj);

              this.dropReport(this.getReportDetails(event.item.data));
            }
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

  }

  showADHOCDialog() {
    this.displayADHOCReport = true;
    this.XLSTemplate = true;

  }

  checkReportName() {
    if (this.reportName.trim() === '') {
      this.reportName = 'Untitled Spreadsheet';
    }

    this.showRename = false;
  }

  saveReport(): void {
    const url = 'http://10.20.0.59:8002/netvision/rest/webapi/adhocreporttemplateexport?access_token=563e412ab7f5a282c15ae5de1732bfd1';
    const fileName = this.reportName + '_' + new Date().getTime();
    const saveOptions: SaveOptions = { url, fileName, saveType: 'Xls' };

    this.spreadsheetObj.save(saveOptions);
  }

  deleteReport() {
    alert('Report deleted');
  }

  createNewTemplate() {
    // let options: ClearOptions = { type: 'Clear All' };
    // this.spreadsheetObj.clear(options);
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

}

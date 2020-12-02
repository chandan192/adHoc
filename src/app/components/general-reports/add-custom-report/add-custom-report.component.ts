import { CRQColumn, CROperand, CRQFilters } from './CRQColumn';
import { Router } from '@angular/router';
import { Component, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, EventEmitter } from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { NvhttpService } from '../../../services/nvhttp.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
// import { NVBreadCrumbService } from '../../../services/nvbreadcrumb.service';
// import { BreadCrumbInfo } from '../../../interfaces/breadcrumbinfo';
@Component({
  selector: 'app-add-custom-report',
  templateUrl: './add-custom-report.component.html',
  styleUrls: ['./add-custom-report.component.css']
})

export class AddCustomReportComponent implements OnInit, OnChanges {
  @ViewChild('menu', { static: false }) menu;
  @Input() XLSTemplate: boolean;
  @Output() XLSTemplateDialog = new EventEmitter<any>();
  // breadInfo: BreadCrumbInfo;
  items: MenuItem[];
  sessionORpage: any[];
  andOr: any[];
  activeIndex = 0;
  jsonData: any;
  customCRQ: any;
  _sessionORpage = 'session';
  _andOr = 'and';
  _selectedColumns: string[] = [];
  _selectedDimension: string[] = [];
  _selectedSorting: { column: string, order: string }[] = [];
  Options1: any[] = [];
  Options2: any[] = [];
  _Options2Value: any;
  prevCheckBoxIndex = -1;
  header: string;
  cols: { field: string; header: string; colIndex: string }[];
  tableData: TreeNode[];
  tableFooter: any[];
  rightClickOptions: MenuItem[] = [];
  dataType: any[];
  _colName: string;
  _formula: string;
  _dataType: string;
  showToolbarBox: boolean;
  CRQ: any;
  columnFilters: any;
  colCount: number;
  noOfFilters: { filters1: any[]; filters2: any[]; filters3: any[]; _filters1: any; _filters2: string; _filters3: any; configurable: boolean, pointerEvents: string }[] = [];
  visible: boolean;
  reportGroup = [
    { label: 'Session', value: 'Session' },
    { label: 'Page', value: 'Page' },
    { label: 'Business Process', value: 'Business Process' },
    { label: 'Events', value: 'Events' },
    { label: 'Browser', value: 'Browser' },
    { label: 'Others', value: 'Others' },
  ];
  _reportGroup = 'Others';
  _reportName: string;
  _reportDescription: string;
  rowSequence = {};
  sequence = {};
  error = '';
  excelHash: any;
  editColumnEnabled = false;
  colIndxToEdit: string;
  // derCounter = 0; // used uniquely define derived column sys name.

  // tslint:disable-next-line: max-line-length
  constructor(
    private http: NvhttpService,
    // private breadCrumbService: NVBreadCrumbService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private scrollDispatcher: ScrollDispatcher) { }

  ngOnInit() {

    // if (NVBreadCrumbService.currentBreadInfo && NVBreadCrumbService.currentBreadInfo.label === 'Ad Hoc Report') {
    //   this.breadInfo = NVBreadCrumbService.currentBreadInfo;
    // } else {
    //   this.breadInfo = new BreadCrumbInfo('Ad Hoc Report', window.location.href, {});
    //   this.breadCrumbService.addbreadCrumb(this.breadInfo, null);
    // }

    this.items = [
      {
        label: 'Column Picker', disabled: false, command: (event: any) => {
          this.activeIndex = 0;
        }
      },
      {
        label: 'Customize Report', disabled: true,
        command: (event: any) => {
          this.activeIndex = 1;
        }
      },
      {
        label: 'Filter Selector', disabled: true,
        command: (event: any) => {
          this.activeIndex = 2;
        }
      }
    ];

    this.http.getCustomReport().subscribe((response: any) => {
      this.jsonData = response;
      const userName = sessionStorage.getItem('sesLoginName');

      if (this.jsonData.hasOwnProperty(userName)) {
        this.customCRQ = this.jsonData[userName];
      }

    });

    this.sessionORpage = [];
    this.sessionORpage.push({ label: 'Session', value: 'session' });
    this.sessionORpage.push({ label: 'Page', value: 'page' });
    // load file customReportsMetaDataAgg.JSON and nvCustomReportMetaData.jsp
    this.loadLibrary();
    this.openStep1();


  }

  ngOnChanges(changes: SimpleChanges) {

  }

  loadLibrary() {
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = this.http.getRequestUrl('/netvision/reports/customReportsMetaDataAgg.js');
    s.async = false;
    document.head.appendChild(s);
    s.addEventListener('load', () => {
      this.sessionPageChange(this.sessionORpage[0]);
    });
    // s.addEventListener('error', () => { })

    const ss = document.createElement('script');
    ss.type = 'text/javascript';
    ss.src = this.http.getRequestUrl('/netvision/reports/nvCustomReportMetaData.jsp');
    ss.async = false;
    document.head.appendChild(ss);
    // s.addEventListener('load', () => { });
    // s.addEventListener('error', () => { })

  }

  // Navigate Back to Reports on Browse Reports Click
  backToReports() {
    // this.breadCrumbService.resetBreadCrumbOverView();
    // this.breadCrumbService.removeBreadCrumb('Ad Hoc Report', NVBreadCrumbService.currentBreadInfo.seq);
    this.router.navigate(['/home/netvision/generalreports']);
  }

  openStep1() {
    this.activeIndex = 0;
    this.header = 'Select the columns and their specific values to be included in the report.';
  }

  openStep2() {

    if (this._selectedColumns.length > 0) {
      this.activeIndex = 1;
      this.items[1].disabled = false;
      this.header = 'Customize the report according to your need. You can also add derived columns to the report.';
    } else {
      this.activeIndex = 0;
      this._snackBar.open('Please Select a Column to Proceed', 'OK', {
        duration: 3000
      });
      return;
    }

    this.CRQ = {};
    this.CRQ.columns = []; // List of columns to be included in CRQ.
    this.CRQ.filters = []; // List of filters to be included in CRQ.
    this.CRQ.rows = []; // List of rows in case of matrix report.
    this.CRQ.description = '';
    this.CRQ.sequence = {};
    this.CRQ.reportType = 'matrix';

    const check = this._selectedSorting.every((el) => {
      return this._selectedColumns.indexOf(el.column) !== -1;
    });

    if (!check) {
      this._selectedSorting = [];
      this.CRQ.orderBy = [];
    }

    this.insertDataInCRQ();

    this.setSequenceRows();
    // setting allFlag in CRQ.rows/ CRQ.columns
    this.setAllFlag();

    // -----constructing primeng table data format----------------
    this.constructTable();
    // ----------------------------------------------------
  }

  constructTable() {
    this.excelHash = {};
    this.tableData = [];
    this.tableFooter = [];
    this.cols = [];

    // tslint:disable-next-line: forin
    for (const i in this.CRQ.columns) {
      this.cols.push({ field: this.CRQ.columns[i].name, header: this.CRQ.columns[i].name, colIndex: '' });
      if (this._selectedDimension.length > 0) {
        this.excelHash[String.fromCharCode(66 + parseInt(i, 10))] = i;
      } else {
        this.excelHash[String.fromCharCode(65 + parseInt(i, 10))] = i;

      }
    }

    if (this._selectedDimension.length > 0) {
      this.cols.unshift({ field: this._selectedDimension[0], header: this._selectedDimension[0], colIndex: '' });

      for (const i in this.Options2) {
        if (this.Options2[i].value === this._selectedDimension[0]) {

          if (this._Options2Value === null) {
            // tslint:disable-next-line: forin
            for (const j in this.Options2[i].array) {
              this.tableData[j] = {} as TreeNode;
              this.tableData[j].data = {};
              this.tableData[j].data[this._selectedDimension[0]] = this.Options2[i].array[j].label;

              for (const k of this.CRQ.columns) {
                this.tableData[j].data[k.name] = null;
              }
            }

          } else {
            this.tableData[0] = {} as TreeNode;
            this.tableData[0].data = {};
            this.tableData[0].data[this._selectedDimension[0]] = this._Options2Value.label;
            for (const m of this.CRQ.columns) {
              this.tableData[0].data[m.name] = null;
            }
          }
        }
      }
      this.tableFooter.push('ColumnTotal');
      for (const i of this.cols) {
        this.tableFooter.push(null);
      }
    } else {
      for (const i of this.cols) {
        this.tableData[0] = {} as TreeNode;
        this.tableData[0].data = {};
        this.tableData[0].data[i.header] = null;
      }
    }

    // adding colIndex for Column Headers
    for (let i = 0; i < this.cols.length; i++) {
      this.cols[i].colIndex = String.fromCharCode(65 + i);
    }

    console.log(this.tableData);
    console.log(this.tableFooter);
    console.log('CRQ.Columns', this.CRQ.columns);
  }

  setSequenceRows() {
    // creating matrix type report presentation.
    // const singleData = [];
    // singleData.push(['']);
    // singleData.push(['']);
    // singleData.push(['']);
    for (let x = 0; x < this.CRQ.columns.length; x++) {
      let colName = '';
      let colTable = '';
      let sugArray = '';
      for (let c = 0; c < window['CustomReportMetaData'].length; c++) {
        if (window['CustomReportMetaData'][c].name.split(' ').join('') === this.CRQ.columns[x].name) {
          colName = window['CustomReportMetaData'][c].column;
          sugArray = window['CustomReportMetaData'][c].SuggestedArray;
          colTable = window['CustomReportMetaData'][c].table;
        }
      }
      if (this.CRQ.columns[x].filterList.length !== 0) {
        let temp = '';
        for (let z = 0; z < this.CRQ.columns[x].filterList.length; z++) {
          for (let v = 0; v < window[sugArray].length; v++) {
            if (window[sugArray][v].name === this.CRQ.columns[x].filterList[z]) {
              temp = window[sugArray][v].name;
            }
          }
          // singleData[0].push(colTable.toUpperCase() + '.' + colName.toUpperCase() + '.' + temp);
          // singleData[2].push(this.CRQ.columns[x].filterList[z]);
        }
      } else {
        // singleData[0].push(colTable.toUpperCase() + '.' + colName.toUpperCase());
        // singleData[2].push(this.CRQ.columns[x].name);
      }
    }
    let rowindex = 0;
    for (let x = 0; x < this.CRQ.rows.length; x++) {
      let rowName = '';
      let rowTable = '';
      let rowArray = '';
      for (let c = 0; c < window['CustomReportMetaData'].length; c++) {
        if (window['CustomReportMetaData'][c].name.split(' ').join('') === this.CRQ.rows[x].name) {
          rowName = window['CustomReportMetaData'][c].column;
          rowArray = window['CustomReportMetaData'][c].SuggestedArray;
          rowTable = window['CustomReportMetaData'][c].table;
        }
      }
      if (this.CRQ.rows[x].filterList.length !== 0) {
        let temp;
        for (let z = 0; z < this.CRQ.rows[x].filterList.length; z++) {
          for (let v = 0; v < window[rowArray].length; v++) {
            if (window[rowArray][v].name === this.CRQ.rows[x].filterList[z]) {
              temp = window[rowArray][v].name;
            }
          }
          // rowsystemname.push(rowTable.toUpperCase() + '.' + rowName.toUpperCase() + '.' + temp);
          this.rowSequence[rowTable.toUpperCase() + '.' + rowName.toUpperCase() + '.' + temp] = {};
          this.rowSequence[rowTable.toUpperCase() + '.' + rowName.toUpperCase() + '.' + temp].rowIndex = rowindex;
          rowindex++;
          // singleData.push([this.CRQ.rows[x].filterList[z]]);
        }
      } else {
        // rowsystemname.push(rowTable.toUpperCase() + '.' + rowName.toUpperCase());
        this.rowSequence[rowTable.toUpperCase() + '.' + rowName.toUpperCase()] = {};
        this.rowSequence[rowTable.toUpperCase() + '.' + rowName.toUpperCase()].rowIndex = rowindex;
        rowindex++;
        // singleData.push([this.CRQ.rows[x].name]);
      }
    }
    // singleData[0].push('Row Total');
    // singleData[2].push('Row Total');
    // singleData.push(['Column Total']);
    // singleData.unshift([]);
    // for (let z = 0; z < singleData[0].length - 2; z++) {
    //   singleData[1].push('');
    // }
    this.rowSequence['Column Total'] = {};
    this.rowSequence['Column Total'].rowIndex = rowindex;
  }

  setAllFlag() {
    // tslint:disable-next-line: forin
    for (const a in this.CRQ.columns) {
      if (this.CRQ.columns[a].metadataFlag && this.CRQ.columns[a].filterList.length === 0) {
        let fl = [];
        for (const b of window['CustomReportMetaData']) {
          if (this.CRQ.columns[a].column === b.column) {
            fl = window[b.SuggestedArray] as unknown as any[];
          }
        }
        for (const c of fl) {
          this.CRQ.columns[a].filterList.push(c.name);
        }
        this.CRQ.columns[a].allFlag = true;
      }


    }

    for (const a of this.CRQ.rows) {
      if (a.metadataFlag && a.filterList.length === 0) {
        let fl = [];
        for (const b of window['CustomReportMetaData'] as unknown as any[]) {
          if (a.column === b.column) {
            fl = window[b.SuggestedArray] as unknown as any[];
          }
        }
        for (const c of fl) {
          a.filterList.push(c.name);
        }
        a.allFlag = true;
      }
    }


  }

  insertDataInCRQ() {
    // NOTE : appliedColumns = _this.selectedColumns
    const colFilterCount = this.getColFilterCount();

    let name = '';
    let filtersList = [];
    const tempColumn = [];
    let countFlag = false;
    let columnObj = null;
    const table = '';
    const column = '';
    let operator = '';
    this.colCount = 0;
    let temp = [];
    const columnIdList = [];

    for (const i of this._selectedColumns) {
      filtersList = [];
      name = i;
      temp = this.getColumnInfo(name);

      const tempResult = [];
      if (temp[0] === 'bpabandoned' || temp[0] === 'bpcompleted') {
        operator = '=';
        tempResult[1] = new CROperand(101, 0);
      } else {
        operator = 'IN';
        tempResult[1] = new CROperand(102, '()');
      }

      tempResult[0] = new CROperand(0, temp[1] + ':' + temp[0]);
      const clmObj3 = new CRQFilters(operator, tempResult, false);

      tempColumn.push(clmObj3);

      filtersList = [];
      countFlag = true;

      this.colCount++;
      columnObj = new CRQColumn(name, filtersList, countFlag, temp[0], temp[1], this.colCount, temp[4]);
      columnIdList.push(this.colCount);
      this.CRQ.columns.push(columnObj);
    }

    // if Dimension checkbox is checked
    // we can check only one dimesion , so the _selectedDimension contains only one element
    for (const i of this._selectedDimension) {
      filtersList = [];
      name = i;
      let temps = [];
      temps = this.getColumnInfo(name);
      if (this._Options2Value !== null) {
        let listedFilters = '';
        let eventFlag = false;
        const eventMask = -1;

        filtersList.push(this._Options2Value);
        if (temps[2] === 'CREventsList') {
          operator = '=';
          eventFlag = true;
        } else {
          operator = 'IN';
          listedFilters = this._Options2Value.value;
        }

        listedFilters = '(' + listedFilters + ')';
        const clmObj1 = new CROperand(0, temps[1] + ':' + temps[0]);
        let clmObj2;
        if (eventFlag) {
          clmObj2 = new CROperand(101, eventMask);
        } else {
          clmObj2 = new CROperand(102, listedFilters);
        }
        const tempResult = [];
        tempResult[0] = clmObj1;
        tempResult[1] = clmObj2;
        const clmObj3 = new CRQFilters(operator, tempResult, true);

        tempColumn.push(clmObj3);

      } else {

        const tempResult = [];
        if (temps[2] === 'CREventsList') {
          operator = '=';
          tempResult[1] = new CROperand(101, 0);
        } else {
          operator = 'IN';
          tempResult[1] = new CROperand(102, '()');
        }
        tempResult[0] = new CROperand(0, temps[1] + ':' + temps[0]);
        const clmObj3 = new CRQFilters(operator, tempResult, false);
        tempColumn.push(clmObj3);
        filtersList = [];
        countFlag = true;
      }
      this.colCount++;
      columnObj = new CRQColumn(name, filtersList, countFlag, temps[0], temps[1], this.colCount, temps[4]);
      this.CRQ.rows.push(columnObj);



    }

    if (this._selectedColumns.length && this._selectedDimension.length) {
      this.columnFilters = tempColumn;
    }
  }

  getColFilterCount() {
    let count = 0;
    for (const i of this._selectedColumns) {
      const info = this.getColumnInfo(i);
      if (info[4]) {
        count++;
      }
    }
    return count;
  }

  getColumnInfo(column) {
    const result = [];
    const table = this._sessionORpage;
    for (const i of window['CustomReportMetaData']) {
      const temp = i.name.split(' ').join('');
      if (column === temp && table === i.group) {
        result[0] = i.column;
        result[1] = i.table;
        result[2] = i.SuggestedArray;
        result[3] = i.type;
        result[4] = i.metadataFlag;
      }
    }
    return result;
  }


  // table right click options
  contextMenu(event, i) {
    // setting right click options for table
    this.rightClickOptions = [
      {
        label: 'Add Column', icon: 'fa fa-plus', disabled: false, visible: true, command: (e: any) => {
          this.showToolbar(true);
        }
      },
      {
        label: 'Delete Column', icon: 'fa fa-close', disabled: false, visible: true, command: (e: any) => {
          this.deleteColumn(i);
        }
      },
      {
        label: 'Edit Column', icon: 'fa fa-pencil', disabled: false, visible: true, command: (e: any) => {
          this.preEditColumn(i);
        }
      },
      {
        label: 'Sort', icon: 'pi pi-sort-alt', disabled: false, visible: true,
        items: [{
          label: 'Sort Ascending', icon: 'pi pi-sort-alpha-down', disabled: false, visible: true, command: (e: any) => {

            this.addSorting({ column: this.CRQ.columns[this.excelHash[i]].name, order: 'ASC' });
          }
        },
        {
          label: 'Sort Descending', icon: 'pi pi-sort-alpha-up-alt', disabled: false, visible: true, command: (e: any) => {
            this.addSorting({ column: this.CRQ.columns[this.excelHash[i]].name, order: 'DESC' });
          }
        }]
      },
      { separator: true },
      {
        label: 'Currency', icon: 'fa fa-usd', disabled: false, visible: true, command: (e: any) => {
          this.handleColFormatOption(i, 'currency');
        }
      },
      {
        label: 'Time', icon: 'fa fa-clock-o', disabled: false, visible: true, command: (e: any) => {
          this.handleColFormatOption(i, 'time');

        }
      },
      {
        label: 'Rate', icon: 'fa fa-percent', disabled: false, visible: true, command: (e: any) => {
          this.handleColFormatOption(i, 'rate');

        }
      },
      {
        label: 'Number', icon: 'fa fa-hashtag', disabled: false, visible: true, command: (e: any) => {
          this.handleColFormatOption(i, 'number');

        }
      },
    ];

    // Dont show right click options if the column header is a dimension
    if (this.excelHash[i] === undefined) {
      this.menu.visible = false;
      // disable the remove column option if the column header is the first or only column header
    } else if (this.excelHash[i] === '0') {
      this.rightClickOptions[1].disabled = true;
      this.menu.toggle(event);

    } else {
      this.rightClickOptions[1].disabled = false;
      this.menu.toggle(event);
    }

    if (this.CRQ.columns[this.excelHash[i]] !== undefined && this.CRQ.columns[this.excelHash[i]].derived === true) {
      this.rightClickOptions[2].visible = true;
    } else {
      this.rightClickOptions[2].visible = false;

    }

    this.scrollDispatcher.scrolled().subscribe(() => this.menu.visible = false);
  }


  addSorting(data: { column: string, order: string }) {
    console.log('data ----', data);
    /*  sort: [{
         column: 'column_name',
         order:'ASC'
     }] */

    if (this.CRQ.orderBy !== undefined) {

      const index = this.CRQ.orderBy.findIndex(x => x.column === data.column);

      if (index === -1) {
        // if the element added is totally different
        this.CRQ.orderBy.push(data);

      } else {
        // check if the element is present and order is different
        this.CRQ.orderBy[index].order = data.order;
      }

    } else {
      // if the CRQ doesnot contain the sort property then add it
      this.CRQ.orderBy = [];
      this.CRQ.orderBy.push(data);
    }


    this._selectedSorting = this.CRQ.orderBy;

    console.log('Sort -------- ', this.CRQ.orderBy);

  }

  preEditColumn(indx) {
    this.colIndxToEdit = '';
    const eh = this.excelHash;
    const col = this.CRQ.columns;
    this.showToolbar(true);
    this._formula = col[eh[indx]].alphaExp;
    this._colName = col[eh[indx]].name;
    const tmp1 = {};
    const tmp = eh[indx];
    this.colIndxToEdit = tmp;
    for (const k in eh) {
      if (k !== indx) {
        tmp1[k] = eh[k];
      }
    }
    this.excelHash = tmp1;
    this.editColumnEnabled = true;
  }

  deleteColumn(indx) {
    const eh = this.excelHash;
    const col = this.CRQ.columns;
    if (col.length <= 1) {
      this._snackBar.open('Need to have a column', 'OK', {
        duration: 3000
      });
      return false;
    }
    if (this.depDerCol(indx)) {
      this._snackBar.open('\'' + indx + '\'' + ' column is used by another column.', 'OK', {
        duration: 3000
      });
      return false;
    }
    if (!col[eh[indx]].derived) {
      // document.getElementsByName(col[eh[indx]].name.trim())[0].checked = false;
      const index = this._selectedColumns.indexOf(col[eh[indx]].name.trim());
      if (index > -1) {
        this._selectedColumns.splice(index, 1);
      }
    }
    const tmp = [];
    col[eh[indx]] = null;
    for (let a = 0; a < col.length; a++) {
      if (col[a] != null) {
        tmp.push(col[a]);
      }
    }
    const tmp1 = {};
    for (const k in eh) {
      if (k !== indx) {
        tmp1[k] = eh[k];
      }
    }
    this.excelHash = tmp1;
    this.CRQ.columns = tmp;
    this.constructTable();
  }

  saveEditCol(tmp) {

    if (this._colName === '') {
      this._snackBar.open('Please Enter Column Name', 'OK', {
        duration: 3000
      });
      return;
    } else if (this._formula === '') {
      this._snackBar.open('Please Enter Formula', 'OK', {
        duration: 3000
      });
      return;
    }

    if (this.error !== '') {
      this._snackBar.open('Please Enter a Valid Formula', 'OK', {
        duration: 3000
      });
      return;
    }

    const form = this._formula;
    const name = this._colName;
    const datatype = this._dataType;
    this.addDerColInCRQ(form, name, datatype, tmp);
    this.editColumnEnabled = false;
  }

  depDerCol(indx) {
    const cl = this.CRQ.columns;
    if (cl[this.excelHash[indx]].hasOwnProperty('derived')) {
      return false;
    }
    for (let a = 0; a < cl.length; a++) {
      if (cl[a].hasOwnProperty('derived')) {
        const tmp = (' ' + cl[a].alphaExp + ' ').replace(/([^0-9A-Za-z])/g, ' $1 ').match(/ [A-Z] | [A-Z][0-9]+ /g);
        if (tmp != null) {
          for (let b = 0; b < tmp.length; b++) {
            if (tmp[b].indexOf(indx) > -1) {
              return true;
            }
          }
        }
      }
    }
  }

  // table right click options for rate, number, time , currency
  handleColFormatOption(index, format) {
    // this.CRQ.columns[excelHash[col]].format = format;

    switch (format) {
      case 'currency':
        this.CRQ.columns[this.excelHash[index]].function = { 'name': 'sum' };
        break;
      case 'time':
        this.CRQ.columns[this.excelHash[index]].function = { 'name': 'agg_avg' };
        break;
      case 'rate':
        this.CRQ.columns[this.excelHash[index]].function = { 'name': 'agg_avg' };
        break;
      case 'number':
        this.CRQ.columns[this.excelHash[index]].function = { 'name': 'sum' };
        break;

      // default:
      //   break;
    }
  }

  showToolbar(value) {
    this.showToolbarBox = value;

    this._colName = '';
    this._formula = '';
    this.dataType = [
      { label: 'Float', value: 'float' },
      { label: 'Integer', value: 'integer' },
      { label: 'String', value: 'string' }
    ];
    this._dataType = 'float';

  }

  openStep3() {
    // if (this.tableData.length > 0) {
    this.activeIndex = 2;
    this.items[2].disabled = false;
    this.header = 'Apply filters to the report and select the operation to be performed between the filters.';
    // } else {
    //   this.activeIndex = 0;
    //   this._snackBar.open('Please Select a Column to Proceed', 'OK', {
    //     duration: 3000
    //   });
    //   return;
    // }
    this.andOr = [];
    this.andOr.push({ label: 'AND', value: 'and' });
    this.andOr.push({ label: 'OR', value: 'or' });

    this.andOrChange(this.andOr[0]);

    this.noOfFilters = [];

    // setting filter div dropdowns
    if (this.noOfFilters.length < 1) {
      this.fixRule();
    }

  }

  // funtion to handle single checkbox select and dropdown enable/disable
  onChange(j: number) {
    this._Options2Value = null;

    const latestValue = this._selectedDimension[this._selectedDimension.length - 1];
    this._selectedDimension.length = 0;

    // if checkbox is selected enable the dropdown
    if (latestValue !== undefined) {
      this._selectedDimension.push(latestValue);
      this.Options2[j].disabled = false;
    } else {
      this._selectedDimension.length = 0;
      this.Options2[j].disabled = true;
      this._Options2Value = null;
    }

    if (this.prevCheckBoxIndex !== -1 && this.prevCheckBoxIndex !== j) {
      this.Options2[this.prevCheckBoxIndex].disabled = true;
    }

    this.prevCheckBoxIndex = j;


  }

  // Incase session  button is selected
  openSession() {
    this._sessionORpage = 'session';
    this._selectedColumns = [];
    this._selectedDimension = [];
    this._Options2Value = null;
    this.Options1 = [];
    this.Options2 = [];
    this.noOfFilters = [];
    this.items[1].disabled = true;
    this.items[2].disabled = true;

    for (const i of window['CustomReportMetaData']) {
      if (i.group === 'session' && !i.metadataFlag) {
        if (i.selectColumnFlag) {
          if (i.advance) {
          } else {
            const temp = i.name.split(' ').join('');
            this.Options1.push({ label: i.name, value: temp });
          }
        }
      }
    }

    for (const i of window['CustomReportMetaData']) {
      if (i.name.toLowerCase().indexOf('store') > -1 || i.name.toLowerCase().indexOf('terminal') > -1) {
        continue;
      }

      if (i.group === 'session' && i.metadataFlag) {
        if (i.selectColumnFlag) {
          if (i.advance) { } else {

            if (i.SuggestedArray !== undefined && i.SuggestedArray !== null && i.SuggestedArray !== '') {
              const tempList = window[i.SuggestedArray];
              const tmpArray = [];
              if (tempList !== undefined) {
                for (const j of tempList as unknown as any[]) {
                  tmpArray.push({ label: j.name, value: j.data.id });
                }
              }
              // const temp = '1' + i.name.split(' ').join('');
              const temp = i.name.split(' ').join('');
              this.Options2.push({ label: i.name, value: temp, array: tmpArray, disabled: true });
            }

          }
        }
      }
    }
  }

  // Incase page button is selected
  openPage() {
    this._sessionORpage = 'page';
    this._selectedColumns = [];
    this._selectedDimension = [];
    this._Options2Value = null;
    this.Options1 = [];
    this.Options2 = [];
    this.noOfFilters = [];
    this.items[1].disabled = true;
    this.items[2].disabled = true;

    for (const i of window['CustomReportMetaData']) {
      if (i.group === 'page' && !i.metadataFlag) {
        if (i.selectColumnFlag) {
          if (i.advance) {
          } else {
            const temp = i.name.split(' ').join('');
            // TODO : display checkbox
            this.Options1.push({ label: i.name, value: temp });
          }
        }
      }
    }

    for (const i of window['CustomReportMetaData']) {
      if (i.name.toLowerCase().indexOf('store') > -1 || i.name.toLowerCase().indexOf('terminal') > -1) {
        continue;
      }
      if (i.group === 'page' && i.metadataFlag) {
        if (i.selectColumnFlag) {
          if (i.advance) { } else {


            if (i.SuggestedArray !== undefined && i.SuggestedArray !== null && i.SuggestedArray !== '') {
              const tempList = window[i.SuggestedArray];
              const tmpArray: any[] = [];
              if (tempList !== undefined) {
                for (const j of tempList as unknown as any[]) {
                  tmpArray.push({ label: j.name, value: j.data.id });
                }
              }
              // const temp = '1' + i.name.split(' ').join('');
              const temp = i.name.split(' ').join('');
              this.Options2.push({ label: i.name, value: temp, array: tmpArray, disabled: true });

            }

          }
        }
      }
    }
  }

  sessionPageChange(e) {
    if (e.value === 'session') {
      this.openSession();
    } else {
      this.openPage();
    }
  }

  andOrChange(e) {
    if (e.value === 'and') { } else { }
  }

  // setting third dropdown on the basis of first dropdown selected value in step3
  setFilter2(i, data) {
    this.noOfFilters[i].filters3 = [];
    this.noOfFilters[i]._filters3 = null;
    // event.value.data
    for (const j of window[data] as unknown as any[]) {
      const tempo = { label: '', value: '' };

      tempo.label = j.name;
      tempo.value = j.data.id;
      this.noOfFilters[i].filters3.push(tempo);
    }
  }

  fixRule() {
    this.noOfFilters.push({ filters1: [], filters2: [], filters3: [], _filters1: null, _filters2: '', _filters3: null, configurable: false, pointerEvents: 'auto' });

    const currentIndex = this.noOfFilters.length - 1;

    for (const i of window['CustomReportMetaData']) {
      const tmp = { label: '', value: '', data: '' };

      if (i.filterOnly && i.group === this._sessionORpage) {

        tmp.label = i.name;
        tmp.value = i.column + ':' + i.type;
        tmp.data = i.SuggestedArray;
        this.noOfFilters[currentIndex].filters1.push(tmp);
      } else if (i.metadataFlag && i.group === this._sessionORpage) {

        tmp.label = i.name;
        tmp.value = i.column + ':' + i.type;
        tmp.data = i.SuggestedArray;
        this.noOfFilters[currentIndex].filters1.push(tmp);
      }
    }

    this.setFilter2(currentIndex, this.noOfFilters[currentIndex].filters1[0].data);

    // setting the values selected by default for filter dropdowns
    this.noOfFilters[currentIndex].filters2 = [
      { label: 'IN', value: 'IN' },
      { label: 'NOT IN', value: 'NOT IN' }
    ];
    this.noOfFilters[currentIndex]._filters1 = this.noOfFilters[currentIndex].filters1[0];
    this.noOfFilters[currentIndex]._filters2 = 'IN';

    // checking previous filter value is selected
    if (currentIndex > 0) {
      if (this.noOfFilters[currentIndex - 1]._filters3 === null && this.noOfFilters[currentIndex - 1].configurable === false) {
        this.noOfFilters.pop();
        this._snackBar.open('Please Select Filter Value', 'OK', {
          duration: 3000
        });
        return;
      }

      // make div uneditable when if its not configurable when next div is created
      this.noOfFilters[currentIndex - 1].pointerEvents = 'none';
    }
  }

  removeRule(j) {
    this.noOfFilters.splice(j, 1);
    if (this.noOfFilters.length === 1) {
      this.noOfFilters[0].configurable = false;
      this.noOfFilters[0].pointerEvents = 'auto';
    }
  }


  saveWizardData() {

    if (this._reportName === '') {
      this._snackBar.open('Please Enter a Report Name', 'OK', {
        duration: 3000
      });
      return;
    }

    if (this.customCRQ !== undefined) {
      for (const i of this.customCRQ) {
        if (this._reportName === i.name) {
          this._snackBar.open('Report Name Already Exists', 'OK', {
            duration: 3000
          });
          return;
        }
      }
    }

    this.CRQ['name'] = this._reportName;
    this.CRQ['description'] = this._reportDescription;
    this.CRQ['group'] = this._reportGroup;
    this.CRQ['sequence']['rows'] = this.rowSequence;
    this.CRQ['sequence']['columns'] = this.sequence;

    if (this.CRQ.rows !== undefined) {
      if (this.CRQ.rows.length === 0) {
        this.CRQ.reportType = 'date';
        this.CRQ.filters = {};
      }
    }

    this.clearFL();
    this.setDataType();

    this.visible = false;
    // make a rest call to save the report

    this.http.saveCustomReport(this.CRQ).subscribe((response: any) => {

      if (this.XLSTemplate) {
        this.XLSTemplateDialog.emit(this.CRQ);
      } else {
        // after making rest call to save report navigate back to general reports component
        // this.breadCrumbService.resetBreadCrumbOverView();
        // this.breadCrumbService.removeBreadCrumb('Ad Hoc Report', NVBreadCrumbService.currentBreadInfo.seq);
        this.router.navigate(['/home/netvision/generalreports']);
      }
    });

  }

  setDataType() {
    // for cols
    for (const i of this.CRQ.columns) {
      if (i.table.toLowerCase().indexOf('derive') > -1) { continue; }
      i.dataType = this.getColDataType(i.column);
      i.function = this.getColFunction(i.column);
    }

    // for rows
    for (const i of this.CRQ.rows) {
      i.dataType = this.getColDataType(i.column);
    }
  }

  getColFunction(column: any): any {
    for (const i of window['CustomReportMetaData']) {
      if (column === i.column) {
        return i.function;
      }
    }
  }

  getColDataType(column: any): any {
    for (const i of window['CustomReportMetaData']) {
      if (column === i.column) {
        return i.dataType;
      }
    }
  }

  clearFL() {
    for (const i of this.CRQ.columns) {
      if (i.allFlag) {
        i.filterList = [];
      }
    }

    for (const i of this.CRQ.rows) {
      if (i.allFlag) {
        i.filterList = [];
      }
    }
  }

  collectFiltersData() {
    let filterObj = null;
    const filters = [];

    // if filters in step3 are selected
    if (this.noOfFilters.length > 1) {
      for (let a = 0; a < this.noOfFilters.length - 1; a++) {
        if (this.noOfFilters[a]._filters3.value.toString().indexOf('ff4') > -1) {
          let operator = ' = ';
          if (this.noOfFilters[a]._filters3.label === 'Hard') {
            operator = ' != ';
          }
          filters.push(
            {
              'type': 1,
              'value': {
                'operands': [
                  {
                    'type': 0,
                    'value': {
                      'column': 'ff4',
                      'table': 'nvpageaggregatetable'
                    }
                  },
                  {
                    'type': 102,
                    'value': '254'
                  }
                ],
                'active': true,
                'operator': operator
              }
            }
          );
          continue;
        }

        const temp = this.noOfFilters[a];
        const temp4 = this.getColumnInfoOfColumn(temp._filters1.value.split(':')[0]);
        const temp1 = new CROperand(0, temp4[1] + ':' + temp4[0]);

        if (temp.configurable === true) {
          const temp2 = new CROperand(temp._filters1.value.split(':')[1], 0);
          const temp3 = [];
          temp3[0] = temp1;
          temp3[1] = temp2;
          filterObj = new CRQFilters(temp._filters2, temp3, false);
          filters.push(filterObj);
        } else {
          if (true) {
            if (true) {
              let selected = '';
              if (temp4[2] === 'CRDeviceTypeList') {
                if (selected === '') {
                  // tslint:disable-next-line: quotemark
                  selected = "\'" + temp._filters3.value + "\'";
                }
              } else if (temp4[0] === 'bpabandoned' || temp4[0] === 'bpcompleted') {
                selected = temp._filters3.value;
              } else {
                if (selected === '') {
                  selected = temp._filters3.value;
                }
              }
              let temp2;
              if (temp4[0] === 'bpabandoned' || temp4[0] === 'bpcompleted') {
                temp2 = new CROperand(101, selected);
              } else {
                temp2 = new CROperand(102, '(' + selected + ')');
              }
              const temp3 = new Array();
              temp3[0] = temp1;
              temp3[1] = temp2;
              if (temp4[0] === 'bpabandoned' || temp4[0] === 'bpcompleted') {
                if (temp._filters2 === 'IN') {
                  filterObj = new CRQFilters('=', temp3, true);
                } else {
                  filterObj = new CRQFilters('!=', temp3, true);
                }
              } else {
                filterObj = new CRQFilters(temp._filters2, temp3, true);
              }
            }
          }
          filters.push(filterObj);
        }
      }

    }

    const operator = this._andOr.toUpperCase();

    // now check if opertor.
    if (this.columnFilters.length === undefined && filters.length === 0) {
      this.CRQ.filters = this.columnFilters;
    } else if (this.columnFilters.length === undefined && filters.length !== 0) {
      if (operator === 'AND') {
        // Combine both columnFilters and filters.
        filters.push(this.columnFilters);
        this.CRQ.filters = this.combineFilters('AND', filters);
      } else {
        // combine columnFIlters with AND
        filterObj = this.combineFilters('OR', filters);
        // now combine both the filters with AND.
        this.CRQ.filters = this.combineFilters('AND', [this.columnFilters, filterObj]);
      }
    } else {
      if (operator === 'AND') {
        // Combine both columnFilters and filters.
        for (let z = 0; z < this.columnFilters.length; z++) {
          filters.push(this.columnFilters[z]);
        }
        this.CRQ.filters = this.combineFilters('AND', filters);
      } else {
        // combine columnFIlters with AND
        const columnFilterObj = this.combineFilters('AND', this.columnFilters);
        filterObj = this.combineFilters('OR', filters);
        // now combine both the filters with AND.
        this.CRQ.filters = this.combineFilters('AND', [columnFilterObj, filterObj]);
      }
    }

  }

  combineFilters(operator, filters): any {
    const operands = [];
    let operand;
    for (const z of filters) {
      operand = {};
      operand.type = 1;
      operand.value = z;
      operands.push(operand);
    }
    // now combine all.
    return new CRQFilters(operator, operands, true);
  }
  getColumnInfoOfColumn(column) {
    const result = [];
    for (const i of window['CustomReportMetaData']) {
      const temp = i.column.split(' ').join('');
      if (column === temp) {
        result[0] = i.column;
        result[1] = i.table;
        result[2] = i.SuggestedArray;
        result[3] = i.type;
        result[4] = i.metadataFlag;
      }
    }
    return result;
  }


  showSavePopup() {
    // show the dialog box
    this.visible = true;
    this.collectFiltersData();

  }

  saveDerCol() {

    if (this._colName === '') {
      this._snackBar.open('Please Enter Column Name', 'OK', {
        duration: 3000
      });
      return;
    } else if (this._formula === '') {
      this._snackBar.open('Please Enter Formula', 'OK', {
        duration: 3000
      });
      return;
    }

    // TODO : invalid formula message
    if (this.error !== '') {
      this._snackBar.open('Please Enter a Valid Formula', 'OK', {
        duration: 3000
      });
      return;
    }

    //

    this.addDerColInCRQ(this._formula, this._colName, this._dataType, null);

  }


  addDerColInCRQ(exp, name, dataType, indx) {
    let derCounter = this.CRQ.columns.length;
    let derindex = derCounter;
    if (indx != null) {
      derindex = parseInt(this.CRQ.columns[indx].column.split('derived').join(''), 10);
    }
    this.CRQ['columns'][derindex] = undefined;
    const cols_temp = [];
    for (let a = 0; a < this.CRQ.columns.length; a++) {
      if (this.CRQ.columns[a] === undefined) { continue; }
      cols_temp.push(this.CRQ.columns[a]);
    }

    this.CRQ.columns = cols_temp;
    const exp1 = exp;
    exp = ' ' + exp.replace(/([^0-9A-Za-z])/g, ' $1 ') + ' ';
    const colIndx = exp.match(/ [A-Z] | [A-Z][0-9]+ /g);
    const eh = this.excelHash;
    const cl = this.CRQ.columns;
    let fl = [];
    let mdF = false;
    if (colIndx != null) {
      for (let a = 0; a < colIndx.length; a++) {
        if (colIndx[a].trim().match(/[0-9]+/)) {
          const tmpCol = colIndx[a].trim().substring(0, 1);
          const tmpSc = parseInt(colIndx[a].trim().substring(1, 2), 10) - 1;
          const sysName = '$' + (cl[eh[tmpCol]].table + '.' + cl[eh[tmpCol]].column).toUpperCase() + '.' + cl[eh[tmpCol]].filterList[tmpSc];
          exp = exp.replace(colIndx[a], sysName);
        } else {
          let sysName = '$' + (cl[eh[colIndx[a].trim()]].table + '.' + cl[eh[colIndx[a].trim()]].column).toUpperCase();
          if (cl[eh[colIndx[a].trim()]].hasOwnProperty('id')) {
            sysName += '.' + cl[eh[colIndx[a].trim()]].id;
          }
          exp = exp.replace(colIndx[a], sysName);
          if (cl[eh[colIndx[a].trim()]].metadataFlag && fl.length === 0) {
            fl = cl[eh[colIndx[a].trim()]].filterList;
          }
        }
      }
    }
    if (fl.length > 0) {
      mdF = true;
    }
    // adding derived column in CRQ.
    derCounter++;
    let idx = cl.length;
    if (indx != null && indx !== undefined) {
      idx = indx;
    }
    cl[idx] = {
      'name': name,
      'exp': exp,
      'derived': true,
      'metadataFlag': mdF,
      'filterList': fl,
      'column': 'derived' + derCounter,
      'table': 'derived',
      'alphaExp': exp1,
      'dataType': this._dataType,
      'format': 'number'
    };
    // adding derived col in excel hash.

    // re-rendering the report table.
    this.constructTable();


    this.showToolbar(false);
  }

  validateFormula(event) {

    const formula = event.target.value;

    // putting space @ start and end of identifiers
    const formulaVal = ' ' + formula.replace(/([^0-9A-Za-z])/g, ' $1 ') + ' ';
    // checking for valid columns.
    this.error = '';
    if (!this.validateColumnIndex(formulaVal)['valid']) {
      this.error = '\'' + this.validateColumnIndex(formulaVal)['column'] + '\' is an invalid column.';
    } else {
      this.hlValidCol(formulaVal);
      if (this.validateColumnCombination(formulaVal)) {
        const tmp = this.validateExpression(formulaVal);
        if (tmp !== null) {
          this.error = tmp;
        }
      }
    }
  }

  hlValidCol(formula) {
    const colIndx = formula.match(/ [A-Z] /g);
    if (colIndx === null) {
      return false;
    }
    const fl = this.CRQ.columns[this.excelHash[colIndx[0].trim()]].filterList;
    // tslint:disable-next-line: forin
    for (const k in this.excelHash) {
      let isValid = true;
      if (k !== colIndx[0].trim()) {
        if (fl.length === this.CRQ.columns[this.excelHash[k]].filterList.length) {
          for (let a = 0; a < fl.length; a++) {
            if (fl[a] !== this.CRQ.columns[this.excelHash[k]].filterList[a]) {
              isValid = false;
            }
          }
        } else {
          isValid = false;
        }
      }

    }
  }

  validateExpression(formulaVal: string) {
    {
      const colIndx = formulaVal.match(/ [A-Z] | [A-Z][0-9]+ /g); // extracting all the column indexes in  a formula.
      if (colIndx != null) {
        for (let a = 0; a < colIndx.length; a++) {
          formulaVal = formulaVal.replace(colIndx[a], '1');
        }
      }
      try {
        // tslint:disable-next-line: no-eval
        eval(formulaVal);
        return null;
      } catch (e) {
        return e;
      }
    }
  }

  validateColumnCombination(formula) {

    const colIndx = formula.match(/ [A-Z] /g);
    let isValid = true;
    let fl = 0;
    let flA = [];
    if (colIndx === null) {
      return isValid;
    }
    for (let a = 0; a < colIndx.length; a++) {
      colIndx[a] = colIndx[a].trim();
      if (this.CRQ.columns[this.excelHash[colIndx[a]]].metadataFlag) {
        if (fl === 0) {
          fl = this.CRQ.columns[this.excelHash[colIndx[a]]].filterList.length;
          flA = this.CRQ.columns[this.excelHash[colIndx[a]]].filterList;
        } else {
          if (fl !== this.CRQ.columns[this.excelHash[colIndx[a]]].filterList.length) {
            isValid = false;
          } else {
            for (let b = 0; b < flA.length; b++) {
              if (flA[b] !== this.CRQ.columns[this.excelHash[colIndx[a]]].filterList[b]) {
                isValid = false;
              }
            }
          }
        }
      }
    }

    return isValid;

  }

  validateColumnIndex(formula) {
    const colIndx = formula.match(/ [A-Z] | [A-Z][0-9]+ /g); // extracting all the column indexes in  a formula.
    const validColIndx = this.getColumnIndexList();
    const status = {};
    if (colIndx != null) {
      for (let a = 0; a < colIndx.length; a++) {
        colIndx[a] = colIndx[a].trim();
        if (validColIndx.indexOf(colIndx[a]) === -1 && isNaN(colIndx[a])) {
          status['valid'] = false;
          status['column'] = colIndx[a];
          return status;
        }
      }
    }
    status['valid'] = true;
    return status;
  }

  getColumnIndexList() {
    const list = [];
    let initFrom = 65;  // starting alphabet.
    if (this.CRQ.reportType === 'matrix') {
      if (this._selectedDimension.length > 0) {
        initFrom = 66;
      } else {
        initFrom = 65;
      }
    } else if (this.CRQ.reportType === 'date-matrix') {
      if (this._selectedDimension.length > 0) {
        initFrom = 67;
      } else {
        initFrom = 65;
      }
    }

    for (let a = 0, b = initFrom; a < this.CRQ.columns.length; a++, b++) {
      list.push(String.fromCharCode(b));
      if (this.CRQ.columns[a].metadataFlag) {
        for (let c = 0; c < this.CRQ.columns[a].filterList.length; c++) {
          list.push(String.fromCharCode(b) + (c + 1));
        }
      }
    }
    return list;
  }

  deleteSorting(val) {
    this._selectedSorting = this._selectedSorting.filter(e => e !== val);
    this.CRQ.orderBy = this._selectedSorting;
  }

}

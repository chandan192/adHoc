import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { MetadataService } from './../../../services/metadata.service';
import { Metadata } from './../../../interfaces/metadata';
import { NvhttpService } from './../../../services/nvhttp.service';
import { FormGroup, FormControl } from '@angular/forms';
import { AppComponent } from './../../../app.component';
import * as moment from 'moment';
import 'moment-timezone';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { HighChartService } from './../../../services/highchart.service';
// import { DataTable } from 'primeng/primeng';
import { HighchartsService } from '../../../services/highcharts.service';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-general-report-child',
  templateUrl: './general-report-child.component.html',
  styleUrls: ['./general-report-child.component.css'],
})

export class GeneralReportChildComponent implements OnInit, OnChanges {
  // @ViewChild('dt', { static: false }) public dataTable: DataTable;
  @ViewChild('charts', { static: false }) public chartEl: ElementRef;
  @Input() selectedCRQ: any;
  @Output() showSidebar: EventEmitter<boolean> = new EventEmitter();

  metadata: Metadata = null;
  channel: any[];
  generalReportForm: FormGroup;
  maxDate: Date;
  startTime: string;
  endTime: string;
  filtercriteria: any;
  selectedCRQData: any;
  CustomReportMetaData: any;
  transformResult: any;
  tableData: TreeNode[] = [];
  cols: any[] = [];
  _selectedColumns: any[];
  tableFooter: any = {};
  data: Object;
  options: Object;
  filterGraph: any;
  _showPieChart = false;
  topFilter = [{ label: 'top', value: 0 }, { label: 'bottom', value: 1 }];
  _topFilter = 0;
  _filterCount = 5;
  _filterGraph;
  showLoader: boolean;
  tableTitle: string;
  opened = true;
  paginator = true;

  lastSelect = [
    { label: 'Hour(s)', value: 'hours' },
    { label: 'Day(s)', value: 'days' },
    { label: 'Week(s)', value: 'weeks' },
    { label: 'Month(s)', value: 'months' },
    { label: 'Year(s)', value: 'years' }
  ];

  bucketize: any[] = [{ label: 'Complete', value: 0 }];
  filters: any[];


  constructor(
    private highcharts: HighchartsService,
    private httpService: NvhttpService,
    private metaDataService: MetadataService,
    private _snackBar: MatSnackBar
  ) {
    this.startTime = '';
    this.endTime = '';
    this.filtercriteria = {};
    this.CustomReportMetaData = {};
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedCRQ.currentValue != undefined) {
      if (changes.selectedCRQ.currentValue.reportType != 'date') {
        this.bucketize = [{ label: 'Complete', value: 0 }];
      } else {
        this.bucketize = [
          { label: 'Hourly', value: 1 },
          { label: 'Daily', value: 2 },
          { label: 'Weekly', value: 3 },
          { label: 'Monthly', value: 4 }
        ];


      }
      if ((changes.selectedCRQ.previousValue.reportType === 'date' && changes.selectedCRQ.currentValue.reportType != 'date') || (changes.selectedCRQ.previousValue.reportType != 'date' && changes.selectedCRQ.currentValue.reportType === 'date')) {
        this.clearReport();
      }
    }

  }

  ngOnInit() {

    // loading transform2 into window Object

    this.loadLibrary();

    this.metaDataService.getMetadata().subscribe((response: any) => {
      this.metadata = response;
      // -------channel----------
      const channelm: any[] = Array.from(this.metadata.channelMap.keys());
      this.channel = channelm.map(key => {
        return {
          label: this.metadata.channelMap.get(key).name,
          value: this.metadata.channelMap.get(key).id
        };
      });

      this.channel.unshift({ label: 'All', value: 'all' });
    });


    this.clearReport();


  }

  getFilterColumns(filterObj, path) {
    const operands = filterObj.operands;
    let variableFlag = false;
    let constantFlag = false;
    if (path == null) {
      path = 'filters';
    }
    for (const z in operands) {
      if (operands[z].type === 0) {
        variableFlag = true;
        if (constantFlag) {
          // enable filter.
          // set path.
          filterObj.path = path;
          this.filters.push(filterObj);
        }
      } else if (operands[z].type === 1) {
        this.getFilterColumns(
          operands[z].value,
          path + '.operands[' + z + '].value'
        );
      } else {
        constantFlag = true;
        // If we got both then just add this filter in fitlers array.
        if (variableFlag) {
          filterObj.path = path;
          this.filters.push(filterObj);
        }
      }
    }
  }

  loadLibrary() {
    const p = document.createElement('script');
    p.type = 'text/javascript';
    p.src = this.httpService.getRequestUrl('/netvision/js/reportUtil.js');
    document.head.appendChild(p);

    const q = document.createElement('script');
    q.type = 'text/javascript';
    q.src = this.httpService.getRequestUrl('/netvision/js/nvCustomReportUtil.js');
    document.head.appendChild(q);

    const r = document.createElement('script');
    r.type = 'text/javascript';
    r.src = this.httpService.getRequestUrl('/netvision/reports/customReportsMetaData.js');
    document.head.appendChild(r);
  }

  clearReport() {
    const time = new Date().getTime();
    const d = new Date(moment.tz(time, AppComponent.config.timeZone).format('MM/DD/YYYY HH:mm:ss'));
    const startT: Date = new Date(d.toDateString() + ' 00:00:00');
    const endT: Date = new Date(d.toDateString() + ' 23:59:00');
    this.maxDate = new Date(d.toDateString() + ' 23:59:00');

    this.generalReportForm = new FormGroup({
      lastValue: new FormControl(1),
      lastSelect: new FormControl('days'),
      stime: new FormControl(startT),
      etime: new FormControl(endT),
      _timefilter: new FormControl('true'),
      bucketize: new FormControl(this.bucketize[0].value),
      channel: new FormControl('all'),
    });
  }

  // allow to input number only in input type
  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onSubmit(f: any) {
    this.transformResult = null;
    this.selectedCRQData = null;
    let hideTableGraph;
    hideTableGraph = document.querySelector<HTMLElement>('#hideTableGraph');
    hideTableGraph.style.display = 'none';
    this.showLoader = false;


    // After the SelectedCRQ value is initialized, add it to the window object
    // if (this.selectedCRQ != null) {
    //   this.filters = [];
    //   if (this.selectedCRQ.reportType !== 'fixed') {
    //     if (this.selectedCRQ.filters.operands !== undefined) {
    //       this.getFilterColumns(this.selectedCRQ.filters, null);
    //     }
    //   }
    // }

    // Form Validation
    if (f._timefilter === 'true') {
      if (f.lastValue === null || f.lastValue === '') {
        this._snackBar.open('Last Time Cannot be Empty', 'OK', {
          duration: 3000
        });
        return;
      }
    } else {
      if (f.stime === null) {
        this._snackBar.open('Start Date Cannot be Empty', 'OK', {
          duration: 3000
        });
        return;
      } else if (f.etime === null) {
        this._snackBar.open('End Date Cannot be Empty', 'OK', {
          duration: 3000
        });
        return;
      } else if (new Date(f.stime).getTime() > new Date(f.etime).getTime()) {
        this._snackBar.open(
          'Start Time Cannot Be Greater Than End Time',
          'OK', {
          duration: 3000
        }
        );
        return;
      }
    }
    this.showLoader = true;
    // -----

    let dateTimeMillis = '';

    if (f._timefilter === 'false') {
      this.filtercriteria = {};
      const d = new Date(f.stime);
      const e = new Date(f.etime);
      const date1 =
        d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear();
      const date2 =
        e.getMonth() + 1 + '/' + e.getDate() + '/' + e.getFullYear();

      const startDateTime = date1 + ' ' + d.toTimeString().split(' ')[0];
      const endDateTime = date2 + ' ' + e.toTimeString().split(' ')[0];

      dateTimeMillis = this.convertDateTimeInMillis(
        startDateTime + '_' + endDateTime,
        f._timefilter
      ).toString();
    } else {
      dateTimeMillis = this.convertDateTimeInMillis(
        f.lastValue + '_' + f.lastSelect,
        f._timefilter
      ).toString();
    }

    const st = new Date(parseInt(dateTimeMillis.split(',')[0], 10));
    const et = new Date(parseInt(dateTimeMillis.split(',')[1], 10));

    this.startTime = st.getMonth() + 1 + '/' + st.getDate() + '/' + st.getFullYear() + ' ' + this.timeTo12HrFormat(st.toString().split(' ')[4].split(':')[0] + ':' + st.toString().split(' ')[4].split(':')[1]);
    this.endTime = et.getMonth() + 1 + '/' + et.getDate() + '/' + et.getFullYear() + ' ' + this.timeTo12HrFormat(et.toString().split(' ')[4].split(':')[0] + ':' + et.toString().split(' ')[4].split(':')[1]);

    const bucketHash = { '0': 0, '1': 1, '2': 24, '3': 168, '4': 720 };

    this.selectedCRQ.queryArg = {};
    this.selectedCRQ.queryArg.startTime = parseInt(dateTimeMillis.split(',')[0]);
    this.selectedCRQ.queryArg.endTime = parseInt(dateTimeMillis.split(',')[1]);
    this.selectedCRQ.queryArg.bucketHrs = bucketHash[f.bucketize.toString()];
    this.selectedCRQ.dateColumn = true;



    // console.log('dateTimeMillis : ', dateTimeMillis);
    // console.log('this.startTime : ', this.startTime);
    // console.log('this.endTime : ', this.endTime);
    // console.log('Form Submitted : ', JSON.stringify(f));

    // setting the filtercriteria to be sent in request
    this.filtercriteria.StartTime = dateTimeMillis.split(',')[0];
    this.filtercriteria.EndTime = dateTimeMillis.split(',')[1];
    this.filtercriteria.DateColumnFlag = true;
    this.filtercriteria.BucketMode = f.bucketize;
    if (f.channel !== 'all') {
      this.filtercriteria.channelid = f.channel;
    } else {
      this.filtercriteria.channelid = null;
    }
    this.filtercriteria.st = this.startTime;
    this.filtercriteria.et = this.endTime;
    console.log('this.filtercriteria : ', this.filtercriteria);

    // getting response from server
    this.httpService.getSelectedCRQData(this.filtercriteria, this.selectedCRQ).subscribe((response: any) => {

      this.selectedCRQData = response;

      // hide the loader in case we got the response
      this.showLoader = false;

      // Show error message incase response is empty
      if (this.selectedCRQData.errorString != null) {
        this._snackBar.open(this.selectedCRQData.errorString, 'OK', {
          duration: 5000
        });
        return;
      } else {
        this.transformResult = window['transformResult2'](this.selectedCRQ, this.selectedCRQData, 'client');
        console.log('this.transformResult : ', this.transformResult);

        //transforming data as per primeng pdatatable
        this.tableData = [];
        this.cols = [];
        this._selectedColumns = [];
        this.filterGraph = [];

        let k = 0;
        let n;
        let i;
        if (this.selectedCRQ.reportType == 'date') {
          n = 1;
          i = 2;
          for (const item of this.transformResult[1]) {
            this.filterGraph.push({ label: item.value, value: item.value });
          }

          this.transformResult[1].unshift({ header: true, colspan: 1, rowspan: 1, value: 'Date/Time', format: 'number' });
        } else if (this.selectedCRQ.reportType == 'matrix') {
          n = 0;
          i = 2;
          for (const item of this.selectedCRQ.columns) {
            this.filterGraph.push({
              label: item.name,
              value: item.name
            });
          }
        } else if (this.selectedCRQ.reportType == 'fixed') {
          i = 1;
          n = 0;
          for (const item of this.selectedCRQ.columnDetails) {
            if (item.isHeader != true) {
              this.filterGraph.push({
                label: item.name,
                value: item.name
              });
            }
          }
        }

        //Incase table has headers with no data except column total
        if (i < this.transformResult.length - 1) {
          for (i; i < this.transformResult.length - 1; i++) {

            this.tableData[k] = {} as TreeNode;
            this.tableData[k].data = {};

            for (let j = 0; j < this.transformResult[n].length; j++) {
              this.tableData[k].data[this.transformResult[n][j].value] = this.transformResult[i][j].value;
              if ((i + 1) == (this.transformResult.length - 1)) {
                this.tableFooter[this.transformResult[n][j].value] = this.transformResult[i + 1][j].value;
              }
            }
            k++;

          }
        } else {
          this.tableData[0] = {} as TreeNode;
          this.tableFooter = {};
          for (let j = 0; j < this.transformResult[n].length; j++) {
            this.tableData[0].data[this.transformResult[n][j].value] = undefined;
            this.tableFooter[this.transformResult[n][j].value] = this.transformResult[i][j].value;
          }
        }

        console.log('this.tableData : ', this.tableData);

        //setting fields and header object
        Object.keys(this.tableData[0].data).forEach(item => {
          // console.log(item);
          this.cols.push({ field: item, header: item });
        });
        this.selectedColumns = this.cols;

        hideTableGraph = document.querySelector<HTMLElement>('#hideTableGraph');
        hideTableGraph.style.display = 'block';

        this._filterGraph = this.filterGraph[0].value;
        this.onTopValueChange(this._topFilter);
        this.showColumnChart();
      }


    });
  }

  showPieChart() {
    this._showPieChart = true;
    const heading = (this._topFilter ? 'Bottom' : 'Top') + ' ' + this._filterCount + ' ' + (this.selectedCRQ.reportType != 'date' ? (this.selectedCRQ.reportType != 'fixed' ? this.selectedCRQ.rows[0].name : this.selectedCRQ.columnDetails[0].name) : this.selectedCRQ.columns[0].name) + ' on ' + this._filterGraph;
    // let graphColumns = [];
    const graphData = [];

    let sumArr = 0;
    for (const i of this.tableData) {
      sumArr = sumArr + i[this._filterGraph];
    }

    if (this.selectedCRQ.reportType != 'date') {
      if (this.selectedCRQ.reportType != 'fixed') {
        for (let i = 0; i < this._filterCount && i < this.tableData.length; i++) {
          graphData.push([this.tableData[i].data[this.selectedCRQ.rows[0].name], (this.tableData[i].data[this._filterGraph]) / sumArr * 100]);
        }

      } else {
        for (let i = 0; i < this._filterCount && i < this.tableData.length; i++) {
          graphData.push([this.tableData[i].data[this.selectedCRQ.columnDetails[0].name], (this.tableData[i].data[this._filterGraph]) / sumArr * 100]);
        }
      }
    } else {
      for (let i = 0; i < this._filterCount && i < this.tableData.length; i++) {
        graphData.push([this.tableData[i].data['Date/Time'], (this.tableData[i].data[this._filterGraph]) / sumArr * 100]);
      }
    }

    this.options = {};
    this.options = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false
      },
      title: {
        text: '<span style="font-size:14px">' + heading + '</span>'
      },
      tooltip: {
        pointFormat: '<b>{point.percentage:.1f}%</b>'
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',

          dataLabels: {
            enabled: true,
            format: '<span style="font-weight:400">{point.name}: {point.percentage:.1f} %</span>',
            // style: {
            //   color: (Highcharts.theme && Highcharts.theme.contrastTextColor) ||
            //     'black'
            // }
          }
        }
      },
      series: [{
        type: 'pie',
        name: '',
        data: graphData
      }]

    };

    this.highcharts.createChart(this.chartEl.nativeElement, this.options);

  }

  showColumnChart() {
    this._showPieChart = false;
    const graphColumns = [];
    const graphData = [];
    for (let i = 0; i < this._filterCount && i < this.tableData.length; i++) {
      if (this.selectedCRQ.reportType != 'date') {
        if (this.selectedCRQ.reportType != 'fixed') {
          graphColumns.push(this.tableData[i].data[this.selectedCRQ.rows[0].name]);
        }
        else {
          graphColumns.push(this.tableData[i].data[this.selectedCRQ.columnDetails[0].name]);
        }


      } else {
        graphColumns.push(this.tableData[i].data['Date/Time']);
      }
    }
    for (let i = 0; i < this._filterCount && i < this.tableData.length; i++) {
      graphData.push(parseInt(this.tableData[i].data[this._filterGraph]));
    }

    const heading = (this._topFilter ? 'Bottom' : 'Top') + ' ' + this._filterCount + ' ' + (this.selectedCRQ.reportType != 'date' ? (this.selectedCRQ.reportType != 'fixed' ? this.selectedCRQ.rows[0].name : this.selectedCRQ.columnDetails[0].name) : this.selectedCRQ.columns[0].name) + ' on ' + this._filterGraph;

    this.options = {};
    this.options = {
      chart: {
        type: 'column',
        height: 320
      },
      title: {
        text: '<span style="font-size:14px">' + heading + '</span>'
      },
      //  subtitle : {
      //   text: 'Source: WorldClimate.com'
      // },
      xAxis: {
        categories: graphColumns,
        crosshair: true
      },
      yAxis: {
        min: 0,
        title: {
          text: this._filterGraph
        }
      },
      tooltip: {
        headerFormat: '<span style="color:{point.color}">{point.key}</span>',
        pointFormat: ': <b>{point.y:.1f} </b>',
        footerFormat: '',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      credits: {
        enabled: false
      },
      series: [{
        name: 'Counts',
        data: graphData
      }]
    }

    this.highcharts.createChart(this.chartEl.nativeElement, this.options);

    // console.log("this.options : ", this.options);
  }

  convertDateTimeInMillis(format, timeFilter) {
    let currentTime = new Date();
    const startEndTime = new Array();
    const time = format.split('_');
    currentTime = new Date(
      currentTime.getTime() +
      currentTime.getTimezoneOffset() * 60000 +
      AppComponent.config.serverOffset
    );

    if (timeFilter === 'false') {
      for (let j = 0; j < 2; j++) {
        const d = new Date(time[j]);
        const n = d.getTime();
        startEndTime[j] = n;
      }
    } else {
      if (time[1] === 'hours') {
        startEndTime[1] = currentTime.getTime();
        startEndTime[0] = startEndTime[1] - time[0] * 60 * 60 * 1000;
      } else if (time[1] === 'days') {
        startEndTime[1] = currentTime.getTime();
        const lastDay =
          currentTime.getHours() * 3600 +
          currentTime.getMinutes() * 60 +
          currentTime.getSeconds();
        // handling for the last day.
        const lastTime =
          lastDay + (parseInt(time[0]) === 1 ? 1 : time[0] - 1) * 24 * 60 * 60 * 1000;
        startEndTime[0] = startEndTime[1] - lastTime;
      } else if (time[1] === 'weeks') {
        startEndTime[1] = currentTime.getTime();
        startEndTime[0] = startEndTime[1] - time[0] * 7 * 24 * 60 * 60 * 1000;
      } else if (time[1] === 'months') {
        startEndTime[1] = currentTime.getTime();
        startEndTime[0] = startEndTime[1] - time[0] * 30 * 24 * 60 * 60 * 1000;
      } else {
        startEndTime[1] = currentTime.getTime();
        startEndTime[0] = startEndTime[1] - time[0] * 365 * 24 * 60 * 60 * 1000;
      }
      return startEndTime;
    }
    return startEndTime;
  }

  // to convert 24 hour format time to am/pm
  // used for view only
  timeTo12HrFormat(time): string {
    const time_part_array = time.split(':');
    let ampm = 'AM';

    if (time_part_array[0] >= 12) {
      ampm = 'PM';
    }

    if (time_part_array[0] > 12) {
      time_part_array[0] = time_part_array[0]; // Removing -12 as Exact time need to be sent
    }

    const formatted_time =
      time_part_array[0] + ':' + time_part_array[1] + ' ' + ampm;

    return formatted_time;
  }

  onTopValueChange(event) {
    this._topFilter = event;

    // Finding bottom n elements

    if (this._topFilter) {
      this.tableData.sort((a, b) => {
        return a[this._filterGraph] - b[this._filterGraph]
      });


    } else {
      // finding top n elements
      this.tableData.sort((a, b) => {
        return b[this._filterGraph] - a[this._filterGraph]
      });
    }

    this._showPieChart ? this.showPieChart() : this.showColumnChart();
  }

  onFilterValueChange(event) {
    this._filterGraph = event.value;
    this._showPieChart ? this.showPieChart() : this.showColumnChart();

  }


  // to convert table data to Excel
  tableToExcel() {
    this.paginator = false;

    setTimeout(() => {
      const table = '<thead>' + document.getElementById('myTable').children[0].children[1].children[0].children[0].innerHTML + '</thead><tbody>' + document.getElementById('myTable').children[0].children[1].children[0].children[2].innerHTML + '</tbody><tfoot>' + document.getElementById('myTable').children[0].children[1].children[0].children[1].innerHTML + '</tfoot>';
      const table1 = '<html><head><style>  thead tr th {background-color:#3774aa;border: thin solid #eee;height:50} thead, tbody tr td{border:thin solid  #eee} tfoot tr td {background-color:#eee;border:thin solid #eee;height:30;font-weight:700}  div {text-align:center;font-weight:700;font-size:16px;}</style></head><body><div><img src=\'' + document.location.origin + '/ProductUI/images/cavi_logo_new.png\'></div><div>' + document.getElementById('grHeading').textContent + '</div><div>' + document.getElementById('grBody').textContent + '</div><table>' + table + '</table></body></html>';
      const myBlob = new Blob([table1], {
        type: 'application/vnd.ms-excel'
      });
      const url = window.URL.createObjectURL(myBlob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.href = url;
      a.download = document.getElementById('grHeading').innerText + '.xls';
      a.click();
      //adding some delay in removing the dynamically created link solved the problem in FireFox
      setTimeout(function () {
        window.URL.revokeObjectURL(url);
      }, 0);

      setTimeout(() => {
        this.paginator = true;
      }, 100);
    }, 500);
  }

  showTitle(e) {
    this.tableTitle = e.target.innerText;
  }

  showHideSidebar(e) {
    this.opened = e;
    this.showSidebar.emit(e);
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    //restore original order
    this._selectedColumns = this.cols.filter(col => val.includes(col));
  }

  isNumber(val) {
    return !isNaN(val);
  }

  download_csv(csv, filename) {
    let csvFile;
    let downloadLink;

    // CSV FILE
    csvFile = new Blob([csv], { type: 'text/csv' });

    // Download link
    downloadLink = document.createElement('a');

    // File name
    downloadLink.download = filename;

    // We have to create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Make sure that the link is not displayed
    downloadLink.style.display = 'none';

    // Add the link to your DOM
    document.body.appendChild(downloadLink);

    // Lanzamos
    downloadLink.click();
  }

  exportCSV() {
    const csv = [];
    const rows = document.querySelectorAll('table tr');

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < rows.length; i++) {
      // tslint:disable-next-line: one-variable-per-declaration
      const row = [], cols = rows[i].querySelectorAll('td, th');

      // tslint:disable-next-line: prefer-for-of
      for (let j = 0; j < cols.length; j++) {
        row.push((cols[j] as HTMLElement).innerText);
      }

      csv.push(row.join(','));
    }

    // Download CSV
    this.download_csv(csv.join('\n'), this.selectedCRQ.crqname + '.csv');
  }

}

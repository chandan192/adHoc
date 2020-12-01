import { Component, OnInit } from '@angular/core';
// import { NVBreadCrumbService } from './../../services/nvbreadcrumb.service';
// import { BreadCrumbInfo } from './../../interfaces/breadcrumbinfo';
import { NvhttpService } from './../../services/nvhttp.service';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { Router } from '@angular/router';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-general-reports',
  templateUrl: './general-reports.component.html',
  styleUrls: ['./general-reports.component.css']
})

export class GeneralReportsComponent implements OnInit {
  generalPanelItems: TreeNode[] = [];
  customPanelItems: TreeNode[] = [];
  // breadInfo: BreadCrumbInfo;
  generalReportData: any;
  customReportData: any;
  selectedCRQ: any;
  selectedCRQFilters: any;
  isChildNode: boolean;
  contextItems: any;
  nodeTitle: string;
  opened = true;

  // View should be hidden until library is not loaded.

  constructor(
    // private breadCrumbService: NVBreadCrumbService,
    private httpService: NvhttpService,
    private scrollDispatcher: ScrollDispatcher,
    private router: Router
  ) {

    // laod supporting scripts.
    this.loadLibrary();
    // making http request to get the side panel data from NVCustomReport
    this.loadPanelMenuData();
  }

  loadLibrary() {
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = this.httpService.getRequestUrl('/netvision/reports/nvCustomReportMetaData.jsp');
    const root = this;
    s.addEventListener('load', () => { });
    s.addEventListener('error', () => { });
    document.head.appendChild(s);
  }

  ngOnInit() {

    // this.loadLibrary();

    // if (NVBreadCrumbService.currentBreadInfo && NVBreadCrumbService.currentBreadInfo.label === 'General Reports') {
    //   this.breadInfo = NVBreadCrumbService.currentBreadInfo;
    // } else {
    //   this.breadInfo = new BreadCrumbInfo('General Reports', window.location.href, {});
    //   this.breadCrumbService.addbreadCrumb(this.breadInfo, null);
    // }
    // making http request to get the side panel data from NVCustomReport
    // this.loadPanelMenuData();
  }

  loadPanelMenuData() {
    this.httpService.getGeneralReport().subscribe((response: any) => {
      this.generalReportData = response;
      console.log('response : ', response);
      for (const i in response.standard) {
        response.standard[i].id = parseInt(i);
      }

      console.log('response: ', response);

      this.generalReportData = this.generalReportData.standard;
      this.generalPanelItems = this.showPanelMenu(this.generalReportData);
      console.log(' this.generalPanelItems :  ', this.generalPanelItems);


      const userName = sessionStorage.getItem('sesLoginName');
      if (response.hasOwnProperty(userName)) {
        this.customReportData = response[userName];
        this.customPanelItems = this.showPanelMenu(this.customReportData);
        console.log('this.customPanelItems :', this.customPanelItems);
      }

      // on ngOnInit, the first panel  value should be expanded and selected by default
      this.generalPanelItems[0].expanded = true;
      this.selectedCRQ = this.generalReportData[0];
      window['selectedCRQ'] = this.selectedCRQ;
      const hideTableGraph = document.querySelector<HTMLElement>('#hideTableGraph');
      hideTableGraph.style.display = 'none';
    });
  }

  showPanelMenu(jsonData) {
    const panelItems: any = [];
    let items: any;
    const group = [];
    // Removing duplicate group name from the record
    for (let i = 0; i < jsonData.length; i++) {
      if (group.indexOf(jsonData[i].group) === -1) {
        group.push(jsonData[i].group);
      }
    }

    // pushing the group and name in the panelItems
    // the group becomes heading and name becomes sub heading under that group
    for (const i of group) {
      panelItems.push({
        label: i,
        'expandedIcon': 'fa fa-folder-open',
        'collapsedIcon': 'fa fa-folder',
        children: []
      });
    }

    for (let i = 0; i < group.length; i++) {
      items = [];
      panelItems[i].children = items;

      for (let j = 0; j < jsonData.length; j++) {
        if (group[i] === jsonData[j].group) {
          items.push({
            label: jsonData[j].name,
            icon: 'fa fa-file'
          });
        }
      }
    }

    return panelItems;
  }

  nodeSelect(event, whichReport) {
    if (event.node.parent != undefined) {
      console.log('Node : ', event);
      let hideTableGraph;
      if (whichReport == 'general') {
        for (const data of this.generalReportData) {
          if (event.node.label === data.name) {
            this.selectedCRQ = data;
            hideTableGraph = document.querySelector<HTMLElement>('#hideTableGraph');
            hideTableGraph.style.display = 'none';
          }
        }
      } else {
        for (const data of this.customReportData) {
          if (event.node.label === data.name) {
            this.selectedCRQ = data;
            hideTableGraph = document.querySelector<HTMLElement>('#hideTableGraph');
            hideTableGraph.style.display = 'none';
          }
        }
      }


      // setting the selectedCRQ to window object
      // tslint:disable-next-line: no-string-literal
      window['selectedCRQ'] = this.selectedCRQ;
      console.log('this.selectedCRQ : ', this.selectedCRQ);
    }
  }

  nodeRightSelect(event) {
    console.log('Right Click :', event);
    let showContext;
    if (event.node.parent != undefined) {
      showContext = document.querySelector<HTMLElement>('body > div.ui-contextmenu.ui-widget.ui-widget-content.ui-corner-all.ui-shadow');
      showContext.style.visibility = 'visible';
      const reportList = event.node.label;
      const userName = sessionStorage.getItem('sesLoginName');

      this.contextItems = [{
        label: 'Delete',
        icon: 'fa fa-remove',
        command: (event: any) => {
          console.log('Event :', event);

          this.httpService.deleteReport(reportList, userName).subscribe(response => {
            console.log('Report Deleted :', response);
            this.loadPanelMenuData();
          });
        }
      }];
    } else {
      this.isChildNode = false;
      showContext = document.querySelector<HTMLElement>('body > div.ui-contextmenu.ui-widget.ui-widget-content.ui-corner-all.ui-shadow');
      showContext.style.visibility = 'hidden';

    }

    this.scrollDispatcher.scrolled().subscribe(x => document.querySelector<HTMLElement>('#doNothing').click());
  }

  openWizard() {
    // this.breadCrumbService.removeBreadCrumb('General Reports', NVBreadCrumbService.currentBreadInfo.seq);
    this.router.navigate(['/home/netvision/generalreports/addCustomReport']);
  }


  // To set title for each node
  getNodeTitle(e) {
    this.nodeTitle = e.target.innerText;
    // console.log("Event : ", e);
  }

  removeNodeTitle() {
    this.nodeTitle = '';
  }

  showSidebar(e) {
    this.opened = e;
  }

}

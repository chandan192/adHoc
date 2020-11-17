import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  static config = {
    proxyServer: '',
    clientName: 'kohls',
    fetchURLFromRemoteServer: true,
    hasStores: 'true',
    timeZone: 'Asia\/Kolkata',
    extensionMode: true,
    isAdmin: true,
    showPagestab: false,
    templateUrl: '',
    cavEpochDiff: 1388534400,
    NDUrl: '',
    serverOffset: 19800000,
    newreplay: true,
    NFUrl: '',
    hasTemplate: false,
    isMobilePresent: true,
    pagesColumns: ''
  };
  title = 'addHoc';

}

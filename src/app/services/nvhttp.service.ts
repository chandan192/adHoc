import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// import 'rxjs/add/operator/map';
@Injectable({
  providedIn: 'root'
})
export class NvhttpService {



  constructor(private http: HttpClient) {
  }

  static apiUrls: any = {
    metadata: '/netvision/reports/nvMetadataAjaxController.jsp?metadata=metadata',
    customreports: '/netvision/rest/webapi/customreports?access_token=563e412ab7f5a282c15ae5de1732bfd1',
    generalreports: '/netvision/rest/webapi/generalreports?access_token=563e412ab7f5a282c15ae5de1732bfd1',
    deleteReports: '/netvision/reports/nvCustomQueryHanlder.jsp?',
    selectedCRQ: '/netvision/reports/nvCustomQueryHanlder.jsp?',
    saveCustomReport: '/netvision/reports/nvCustomQueryHanlder.jsp?requestString=writeCRQFile',
    templateReportList: '/netvision/rest/webapi/adhocreportlist?access_token=563e412ab7f5a282c15ae5de1732bfd1',
    templateReportDetails: '/netvision/rest/webapi/adhocreportjson?access_token=563e412ab7f5a282c15ae5de1732bfd1'
  };


  // for testing set machine ip,port,protocol
  ip = '10.20.0.53';
  port = '8029';
  // ip = '10.20.0.64';
  // port = '8005';
  protocol = 'http';

  // TODO: Move this in a seperate file and add as provider.
  getRequestUrl(path) {
    // uncomment for testing.
    return this.protocol + '://' + this.ip + ':' + this.port + path;
    // return path;
  }

  getMetaData(): Observable<any> {
    return this.http.get(this.getRequestUrl(NvhttpService.apiUrls.metadata)).pipe(map((response: Response) => response));
  }

  getCustomReport() {
    const sesLoginName = sessionStorage.getItem('sesLoginName');
    let url = this.getRequestUrl(NvhttpService.apiUrls.customreports);
    url += '&sesLoginName=' + sesLoginName;
    return this.http.get(url).pipe(map((response: Response) => response));
  }

  saveCustomReport(CRQ) {
    const sesLoginName = sessionStorage.getItem('sesLoginName');
    let url: string = this.getRequestUrl(NvhttpService.apiUrls.saveCustomReport);
    url += '&username=' + sesLoginName;

    return this.http.post(url, 'crq=' + JSON.stringify(CRQ, undefined, 4), {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      responseType: 'text'
    }).pipe(map((response: any) => response));
  }

  getGeneralReport() {
    const sesLoginName = sessionStorage.getItem('sesLoginName');
    let url = this.getRequestUrl(NvhttpService.apiUrls.generalreports);
    url += '&sesLoginName=' + sesLoginName;
    return this.http.get(url).pipe(map((response: Response) => response));
  }

  deleteReport(deleteList, userName) {
    let url = this.getRequestUrl(NvhttpService.apiUrls.deleteReports);
    url += 'requestString=deleteReport&reportName=' + deleteList + '&username=' + userName;
    return this.http.post(url, '', {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      responseType: 'text'
    }).pipe(map((response: any) => response));
  }

  getSelectedCRQData(filter: any, formData: any) {

    let url: string = this.getRequestUrl(NvhttpService.apiUrls.selectedCRQ);
    url += 'StartTime=' + filter.StartTime + '&EndTime=' + filter.EndTime + '&DateColumnFlag=' + filter.DateColumnFlag + '&BucketMode=' + filter.BucketMode;
    if (filter.channelid !== null) {
      url += '&channelid=' + filter.channelid;
    }
    url += '&st=' + filter.st + '&et=' + filter.et;

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    const options = {
      headers,
    };
    const data = 'jsonString=' + JSON.stringify(formData);
    return this.http.post(url, data, options).pipe(map((response: Response) => response));

  }

  getTeplateReportList() {
    let url: string = this.getRequestUrl(NvhttpService.apiUrls.templateReportList);
    return this.http.get(url).pipe(map((response: Response[]) => response));
  }

  getTemplateReportDetail(report) {
    let url: string = this.getRequestUrl(NvhttpService.apiUrls.templateReportDetails);
    url += '&reportName=' + report;
    return this.http.get(url).pipe(map((response: Response) => response));

  }

}

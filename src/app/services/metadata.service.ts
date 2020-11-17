import { Metadata } from './../interfaces/metadata';
import { Injectable, Inject } from '@angular/core';
import { NvhttpService } from './nvhttp.service';
import { Observable } from 'rxjs';
// import { Http, Response} from '@angular/http';

@Injectable({ providedIn: 'root' })
export class MetadataService {

  httpService: NvhttpService;

  private metadata: Metadata;

  refreshMetaData: boolean;

  // to  keep track , if metadata request is already in pending state
  requestInProgress: boolean;
  // array to keep observer
  pendingMetadataRequest: any[];

  constructor(@Inject(NvhttpService) httpService) {
    this.metadata = null;

    this.httpService = httpService;
    // to refresh the metadata after every 5 minutes
    // on true, it will nullify the present metadata
    this.refreshMetaData = false;

    this.pendingMetadataRequest = [];
    // load metadata.
    // this.refreshMetadata();
  }

  refreshMetadata() {
    this.httpService.getMetaData().subscribe(response => this.fillMetaData(response));
  }

  getMetadata() {
    if (this.refreshMetaData === true) {
      this.metadata = null;
      this.refreshMetaData = false;
    }
    // tslint:disable-next-line: deprecation
    return Observable.create(observer => {
      if (this.metadata !== null) {
        observer.next(this.metadata);
        observer.complete();
      } else if (this.requestInProgress === true) {
        this.pendingMetadataRequest.push(observer);
      } else {
        this.requestInProgress = true;
        // make http requet and then send that
        this.httpService.getMetaData().subscribe(response => {
          // set metadata and call observer
          this.fillMetaData(response);
          observer.next(this.metadata);
          observer.complete();
          // tslint:disable-next-line: no-shadowed-variable
          this.pendingMetadataRequest.forEach(observer => {
            observer.next(this.metadata);
            observer.complete();
          });
          this.pendingMetadataRequest = [];
          this.requestInProgress = false;
        });
      }
    });
  }

  fillMetaData(response: any) {
    this.metadata = Metadata.getMetaDataObj(response);
    // once the metadata is populated, after every 5 minutes, refreshMetaData flag will turn true to again load the metadata
    const root = this;
    setTimeout(() => { root.refreshMetaData = true; }, 300000);
  }

}

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface ServiceEvent {
  key: any;
  data?: any;
}
@Injectable({
  providedIn: 'root'
})
export class BroadcastService {
  // tslint:disable-next-line: variable-name
  private _eventCallBack = new Subject<ServiceEvent>();

  constructor() { }

  broadcast(key: any, data?: any) {
    console.log('BroadCast called');
    this._eventCallBack.next({ key, data });
  }

  on<T>(key: any): Observable<T> {
    return this._eventCallBack.asObservable()
      .pipe(filter(event => event.key === key))
      .pipe(map(event => event.data as T));
  }
}

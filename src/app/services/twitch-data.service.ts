import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TwitchDataService {

  constructor(private http: HttpClient) { }

  getChannelLogs(channel: string, date:string ): Observable<string> {
    return this.http.get(`https://logs.ivr.fi/channel/${channel}/${date}`, {responseType: 'text'}).pipe(map( r => r))
  }
}

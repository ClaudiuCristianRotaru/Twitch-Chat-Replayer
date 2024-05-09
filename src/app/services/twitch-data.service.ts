import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CLIENT_ID, CLIENT_SECRET } from '../config'

@Injectable({
  providedIn: 'root'
})
export class TwitchDataService {

  constructor(private http: HttpClient) { }

  getChannelLogs(channel: string, date:string ): Observable<string> {
    return this.http.get(`https://logs.ivr.fi/channel/${channel}/${date}`, {responseType: 'text'}).pipe(map( r => r))
  }

  getTwitchOAuth(): Observable<any> {
    const myheader = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')

    let body = new HttpParams();
    
    body = body.set('client_id', CLIENT_ID);
    body = body.set('client_secret', CLIENT_SECRET);
    body = body.set('grant_type', 'client_credentials');
    
    return this.http.post<any>('https://id.twitch.tv/oauth2/token', body, {headers:myheader});
  }
}

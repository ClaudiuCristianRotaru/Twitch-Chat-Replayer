import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BttvEmoteRequest } from '../models/bttv-emote-request';

@Injectable({
  providedIn: 'root'
})
export class EmoteSetService {

  constructor(private http: HttpClient) { }

  getAllEmotes() {
  }

  getBttvEmotes() {
    //https://7tv.io/v3/users/twitch/96858382
    return this.http.get<BttvEmoteRequest>("https://api.betterttv.net/3/cached/users/twitch/96858382");
  }
}

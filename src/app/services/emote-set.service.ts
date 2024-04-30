import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BttvEmote } from '../models/bttv-emote-request';
import { Observable, map, merge, take, forkJoin, mergeAll } from 'rxjs';
import { Emote } from '../models/emote';
import { SevenTvEmote } from '../models/seventv-emote-request';

@Injectable({
  providedIn: 'root'
})
export class EmoteSetService {

  constructor(private http: HttpClient) { }

  getAllEmotes(userId:string) : Observable<Emote[]> {
    let bttvUserEmotes = this.getBttvUserEmotes(userId);
    bttvUserEmotes.subscribe(r=> console.log(r));
    let bttvGlobalEmotes = this.getBttvGlobalEmotes();
    bttvGlobalEmotes.subscribe(r=> console.log(r));
    let allEmotes = merge(bttvGlobalEmotes, bttvUserEmotes);
    console.log(2);
    return allEmotes;
  }

  getBttvUserEmotes(userId:string): Observable<Emote[]> {
    return this.http.get<{channelEmotes: BttvEmote[], sharedEmotes: BttvEmote[]}>(`https://api.betterttv.net/3/cached/users/twitch/${userId}`).pipe(map(res => res.channelEmotes.concat(res.sharedEmotes).map(em => 
      new Emote(em.code,`https://cdn.betterttv.net/emote/${em.id}/2x.webp`,em.width,em.height)
  )))
  }
  
  getBttvGlobalEmotes(): Observable<Emote[]> {
    return this.http.get<BttvEmote[]>(`https://api.betterttv.net/3/cached/emotes/global`).pipe(map(res=> 
      res.map(em=>new Emote(em.code,`https://cdn.betterttv.net/emote/${em.id}/2x.webp`,em.width,em.height))));
  }

  get7TvUserEmotes(userId:string): Observable<Emote[]> {
    return this.http.get<SevenTvEmoteRequest>(`https://7tv.io/v3/users/twitch/${userId}`).pipe(map(res=> res.emote_set.emotes.map(em =>
        new Emote(em.name, `https://cdn.7tv.app/emote/${em.id}/2x.webp`, em.data.host.files[0].width, em.data.host.files[0].height)
      )))
  }
}

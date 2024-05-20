import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BttvEmote } from '../models/bttv-emote';
import { Observable, map, take, switchMap } from 'rxjs';
import { Emote } from '../models/emote';
import { SevenTvEmote } from '../models/seventv-emote';
import { TwitchDataService } from './twitch-data.service';
import { TwitchEmote } from '../models/twitch-emote';

@Injectable({
  providedIn: 'root'
})
export class EmoteSetService {

  constructor(private http: HttpClient, private twitchDataService: TwitchDataService) { }

  getBttvUserEmotes(userId: string): Observable<Emote[]> {
    return this.http.get<{ channelEmotes: BttvEmote[], sharedEmotes: BttvEmote[] }>(`https://api.betterttv.net/3/cached/users/twitch/${userId}`).pipe(map(response =>
      response.channelEmotes.concat(response.sharedEmotes).map(emote =>
        new Emote(emote.code, `https://cdn.betterttv.net/emote/${emote.id}/2x.webp`, emote.width, emote.height)
      )));
  }

  getBttvGlobalEmotes(): Observable<Emote[]> {
    return this.http.get<BttvEmote[]>(`https://api.betterttv.net/3/cached/emotes/global`).pipe(map(response =>
      response.map(emote =>
        new Emote(emote.code, `https://cdn.betterttv.net/emote/${emote.id}/2x.webp`, emote.width, emote.height)
      )));
  }

  get7TvUserEmotes(userId: string): Observable<Emote[]> {
    return this.http.get<{ emote_set: { emotes: SevenTvEmote[] } }>(`https://7tv.io/v3/users/twitch/${userId}`).pipe(map(response =>
      response.emote_set.emotes.map(emote =>
        new Emote(emote.name, `https://cdn.7tv.app/emote/${emote.id}/2x.webp`, emote.data.host.files[0].width, emote.data.host.files[0].height)
      )));
  }

  get7TvGlobalEmotes(): Observable<Emote[]> {
    return this.http.get<{ emotes: SevenTvEmote[] }>("https://7tv.io/v3/emote-sets/global").pipe(map(res =>
      res.emotes.map(em =>
        new Emote(em.name, `https://cdn.7tv.app/emote/${em.id}/2x.webp`, em.data.host.files[0].width, em.data.host.files[0].height)
      )));
  }

  getTwitchGlobalEmotes(): Observable<Emote[]> {
    return this.twitchDataService.getTwitchOAuth().pipe(take(1), switchMap(token => {
      return this.http.get<{data: TwitchEmote[]}>('https://api.twitch.tv/helix/chat/emotes/global', { headers: { 'Authorization': `Bearer ${token.access_token}`, 'Client-Id': 'pqbz440gmziwwsplgkrf96fv6y6ma5' } }).pipe(map(result =>
        result.data.map(emote =>
          new Emote(emote.name, `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/${emote.format[1] != undefined ? emote.format[1] : emote.format[0]}/dark/2.0`, 32, 32)
        )));
    }));
  }

  getTwitchUserEmotes(userId:string): Observable<Emote[]> {
    return this.twitchDataService.getTwitchOAuth().pipe(take(1), switchMap(token => {
      return this.http.get<{data: TwitchEmote[]}>(`https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${userId}`, { headers: { 'Authorization': `Bearer ${token.access_token}`, 'Client-Id': 'pqbz440gmziwwsplgkrf96fv6y6ma5' } }).pipe(map(result =>
        result.data.map(emote =>
          new Emote(emote.name, `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/${emote.format[1] != undefined ? emote.format[1] : emote.format[0]}/dark/2.0`, 32, 32)
        )));
    }));
  }
}

import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmotifyPipe } from '../pipes/emotify.pipe';
import { EmoteSetService } from '../services/emote-set.service';
import { take } from 'rxjs';
import { Emote } from '../models/emote';
import { Time } from '../logic/time';
import { Message } from '../models/message';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { TwitchDataService } from '../services/twitch-data.service';
import { UserData } from '../models/user-data';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EmotifyPipe, MatSliderModule, FormsModule],
  providers: [EmotifyPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit, AfterViewChecked {

  readonly USER_COLORS: string[] = ['red', 'green', 'turquoise', 'pink', 'limegreen', 'orange', 'burlywood', 'lightgray'];
  readonly MAX_DISPLAYED_MESSAGES: number = 100;

  title = 'chat-replay-frontend';
  sliderValueMinutes: number = 20;
  timerWorker!: Worker;
  emoteSet: Emote[] = [];
  messages: Message[] = [];
  userData!: UserData;
  channel: string = "erobb221";
  date: string = "2024/5/9";

  constructor(
    private emoteSetService: EmoteSetService,
    private twitchDataService: TwitchDataService,
  ) { }

  ngOnInit(): void {
    console.log("ngOnInit() called.")

    if (typeof Worker !== 'undefined') this.timerWorker = new Worker(new URL('./timer.worker.ts', import.meta.url));

    this.scrollToBottom();
    this.getChannelData();
    this.initWorkerListener();
  }

  getChannelData() {
    this.twitchDataService.getUserData(this.channel).subscribe(r => {
      this.userData = r;
      console.log(this.userData);

      this.twitchDataService.getChannelLogs(this.channel, this.date).pipe(take(1)).subscribe({
        next: (response) => {
          let splitRequest: string[] = response.split("\r\n");
          if (typeof Worker !== 'undefined')
            this.messageWorker(splitRequest, new Time(0, 0, 0))
        },
        error: (e) => {
          console.log('error');
          this.addMessage(new Message("", new Time(), "", "SERVER", `Logs from ${this.channel} on ${this.date} are not available.`))
        }

      })
      this.fetchEmoteSet();
    })
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  initWorkerListener() {
    this.timerWorker.onmessage = (msg: any) => {
      if (msg.data.status == 'finished') {
        this.addMessage(new Message("", new Time(), "", "SERVER", msg.data.content));
        return;
      }
      let messageData = msg.data.content;
      let messageTime: Time = new Time(
        messageData.time.hours,
        messageData.time.minutes,
        messageData.time.seconds,
        messageData.time.milliseconds);
      this.sliderValueMinutes = messageTime.hours * 60 + messageTime.minutes;
      let message: Message = new Message(
        messageData.date,
        messageTime,
        messageData.channel,
        messageData.author,
        messageData.content);
      this.addMessage(message);
    }
  }

  messageWorker(messages: any, time: any): void {
    this.timerWorker.postMessage({ messages: messages, time: time })
  }

  updateCurrentTime(): void {
    let t: Time = new Time();
    t = t.convertMsToTime(this.sliderValueMinutes * 60 * 1000);
    console.log(t);
    this.addMessage(new Message("", new Time(), "", "SERVER", `Showing messages from: ${t.toShortString()} TriHard O_o 4Weird 4Mad`));
    this.timerWorker.postMessage({ time: t })
  }

  formatSliderTimeLabel(value: number): string {
    let t = new Time();
    t = t.convertMsToTime(value * 60 * 1000);
    return t.toShortString();
  }

  addMessage(message: Message): void {
    //messages container direction is reversed
    this.messages.splice(0, 0, message);
    if (this.messages.length > this.MAX_DISPLAYED_MESSAGES) this.messages.splice(this.messages.length - 1, 1);
  }

  getNewChannelData() {
    console.log(this.channel);
    console.log(this.date);
    this.messages = [];
    this.getChannelData();
  }

  fetchEmoteSet(): void {
    this.emoteSet = [];
    this.emoteSetService.getBttvUserEmotes(this.userData.twitch_id).pipe(take(1)).subscribe(response => {
      this.emoteSet = this.emoteSet.concat(response);
    });
    this.emoteSetService.getBttvGlobalEmotes().pipe(take(1)).subscribe(response => {
      this.emoteSet = this.emoteSet.concat(response);
    });

    this.emoteSetService.get7TvUserEmotes(this.userData.twitch_id).pipe(take(1)).subscribe(response => {
      this.emoteSet = this.emoteSet.concat(response);
    });;

    this.emoteSetService.get7TvGlobalEmotes().pipe(take(1)).subscribe(response => {
      this.emoteSet = this.emoteSet.concat(response);
    });

    this.emoteSetService.getTwitchGlobalEmotes().pipe(take(1)).subscribe(response => {
      this.emoteSet = this.emoteSet.concat(response);
    });

    this.emoteSetService.getTwitchUserEmotes(this.userData.twitch_id).pipe(take(1)).subscribe(response => {
      console.log(response);
      this.emoteSet = this.emoteSet.concat(response);
    });
  }

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}

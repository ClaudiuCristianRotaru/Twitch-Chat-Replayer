import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { EmotifyPipe } from '../pipes/emotify.pipe';
import { EmoteSetService } from '../services/emote-set.service';
import { take } from 'rxjs';
import { Emote } from '../models/emote';
import { ChatReplayer } from '../logic/chat-replayer';
import { Time } from '../logic/time';
import { Message } from '../models/message';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { TwitchDataService } from '../services/twitch-data.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, EmotifyPipe, MatSliderModule, FormsModule],
  providers: [EmotifyPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit, AfterViewChecked {

  readonly userColors: string[] = ['red', 'green', 'turquoise', 'pink', 'limegreen', 'orange', 'burlywood', 'lightgray'];
  readonly MAX_DISPLAYED_MESSAGES: number = 100;

  sliderValueMinutes: number = 20;
  timerWorker: any;
  title = 'chat-replay-frontend';
  emoteSet: Emote[] = [];
  messages: Message[] = [];
  userId: string = "96858382"
  replayer: ChatReplayer = new ChatReplayer();
  channel: string = "erobb221";
  date: string = "2024/4/18";

  constructor(
    private emoteSetService: EmoteSetService, 
    private twitchDataService: TwitchDataService
  ) { }

  ngOnInit(): void {
    console.log("ngOnInit() called.")
    this.scrollToBottom();
    this.twitchDataService.getChannelLogs(this.channel, this.date).pipe(take(1)).subscribe(response => {
      let splitRequest: string[] = response.split("\r\n");
      if (typeof Worker !== 'undefined') {
        console.log("Trying to init worker");
        this.initWorker(splitRequest);
      }
      else {
        console.log("Worker is not supported");
      }
    })
    this.fetchEmoteSet();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  placeholderClick() {
    console.log('update');
  }

  initWorker(msgs: string[]) {
    this.timerWorker = new Worker(new URL('./timer.worker.ts', import.meta.url));
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
    this.timerWorker.postMessage({ messages: msgs, time: new Time(22, 59, 50) })
  }

  updateCurrentTime(): void {
    let t: Time = new Time();
    t = t.convertMsToTime(this.sliderValueMinutes * 60 * 1000);
    console.log(t);
    this.addMessage(new Message("", new Time(), "", "SERVER", `Showing messages from: ${t.toShortString()}`));
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

  fetchEmoteSet(): void {
    this.emoteSetService.getBttvUserEmotes(this.userId).pipe(take(1)).subscribe(response => {
      this.emoteSet = this.emoteSet.concat(response);
    });
    this.emoteSetService.getBttvGlobalEmotes().pipe(take(1)).subscribe(response => {
      this.emoteSet = this.emoteSet.concat(response);
    });

    this.emoteSetService.get7TvUserEmotes(this.userId).pipe(take(1)).subscribe(response => {
      this.emoteSet = this.emoteSet.concat(response);
    });;

    this.emoteSetService.get7TvGlobalEmotes().pipe(take(1)).subscribe(response => {
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

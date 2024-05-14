import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmotifyPipe } from '../pipes/emotify.pipe';
import { EmoteSetService } from '../services/emote-set.service';
import { Observable, take } from 'rxjs';
import { Emote } from '../models/emote';
import { Time } from '../logic/time';
import { Message } from '../models/message';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { TwitchDataService } from '../services/twitch-data.service';
import { UserData } from '../models/user-data';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EmotifyPipe, MatSliderModule, MatInputModule, MatFormFieldModule, FormsModule],
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
  isAudioEnabled: boolean = false;
  constructor(
    private emoteSetService: EmoteSetService,
    private twitchDataService: TwitchDataService,
  ) { }

  ngOnInit(): void {
    console.log("ngOnInit() called.")
    console.log(Date.now());
    if (typeof Worker !== 'undefined') this.timerWorker = new Worker(new URL('./timer.worker.ts', import.meta.url));

    this.scrollToBottom();
    this.getChannelData();
    this.initWorkerListener();
  }

  getChannelData() {
    this.twitchDataService.getUserData(this.channel).subscribe({
      next: dataResponse => {
        this.userData = dataResponse;
        console.log(this.userData);

        this.twitchDataService.getChannelLogs(this.channel, this.date).pipe(take(1)).subscribe({
          next: (response) => {
            let splitRequest: string[] = response.split("\r\n");
            if (typeof Worker !== 'undefined')
              this.messageWorker(splitRequest, new Time(0, 0, 0))
          },
          error: (e) => this.addErrorMessage(`Logs from ${this.channel} on ${this.date} are not available.`, e)
        })
        this.fetchEmoteSet();
      },
      error: (e) => this.addErrorMessage(`Could not retrieve data about ${this.channel}`,e)
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
    if (this.isAudioEnabled) this.playMessageSfx();
    if (this.messages.length > this.MAX_DISPLAYED_MESSAGES) this.messages.splice(this.messages.length - 1, 1);
  }

  addErrorMessage(errorMessage: string, error: any) {
    console.error(errorMessage, error);
    this.addMessage(new Message("", new Time(), "", "SERVER", errorMessage));
  }

  getNewChannelData() {
    this.messages = [];
    this.getChannelData();
  }

  playMessageSfx() {
    let audio = new Audio();
    audio.src = "../../../assets/pop.mp3";
    audio.load();
    audio.play();
  }

  fetchEmoteSet(): void {
    this.emoteSet = [];
    let x: { emoteSetName: string, emoteRequest: Observable<Emote[]> }[] = [];

    x.push({ emoteSetName: "BTTV global", emoteRequest: this.emoteSetService.getBttvGlobalEmotes() });
    x.push({ emoteSetName: "7TV global", emoteRequest: this.emoteSetService.get7TvGlobalEmotes() });
    x.push({ emoteSetName: "Twitch global", emoteRequest: this.emoteSetService.getTwitchGlobalEmotes() });
    x.push({ emoteSetName: "BTTV user", emoteRequest: this.emoteSetService.getBttvUserEmotes(this.userData.twitch_id) });
    x.push({ emoteSetName: "7TV user", emoteRequest: this.emoteSetService.get7TvUserEmotes(this.userData.twitch_id) });
    x.push({ emoteSetName: "Twitch user", emoteRequest: this.emoteSetService.getTwitchUserEmotes(this.userData.twitch_id) });

    x.forEach(r => r.emoteRequest.pipe(take(1)).subscribe({
      next: (response) => this.emoteSet = this.emoteSet.concat(response),
      error: (e) => this.addErrorMessage(`${this.channel}'s "${r.emoteSetName}" emote set couldn't be fetched`, e),
    }));
  }

  reloadDataSet() {
    this.messages = [...this.messages];
  }

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}

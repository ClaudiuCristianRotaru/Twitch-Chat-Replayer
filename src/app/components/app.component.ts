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
import { MatButtonModule } from '@angular/material/button';
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EmotifyPipe, MatSliderModule, MatInputModule, MatFormFieldModule, FormsModule, MatButtonModule],
  providers: [EmotifyPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit, AfterViewChecked {
  readonly USER_COLORS: string[] = ['red', 'green', 'turquoise', 'pink', 'limegreen', 'orange', 'burlywood', 'lightgray'];
  readonly MAX_DISPLAYED_MESSAGES: number = 100;

  title = 'chat-replay-frontend';
  sliderValueMinutes: number = 0;
  timerWorker!: Worker;
  emoteSet: Emote[] = [];
  messages: Message[] = [];
  userData!: UserData;
  channel: string = "velcuz";
  date: string = "2024/1/1";
  draggingSlider: boolean = false;
  isAudioEnabled: boolean = false;
  constructor(
    private emoteSetService: EmoteSetService,
    private twitchDataService: TwitchDataService,
  ) { }

  ngOnInit(): void {
    console.log("ngOnInit() called.");
    const todayDate = new Date(Date.now());
    this.date = `${todayDate.getUTCFullYear()}/${todayDate.getUTCMonth()+1}/${todayDate.getUTCDate()}`;
    if (typeof Worker !== 'undefined') this.timerWorker = new Worker(new URL('./timer.worker.ts', import.meta.url));

    this.scrollToBottom();
    this.getChannelData();
    this.initWorkerListener();
  }

  getChannelData() {
    this.twitchDataService.getUserData(this.channel).subscribe({
      next: dataResponse => {
        this.userData = dataResponse;
        this.twitchDataService.getChannelLogs(this.channel, this.date).pipe(take(1)).subscribe({
          next: (response) => {
            const splitRequest: string[] = response.split("\r\n");
            if (typeof Worker !== 'undefined')
              this.messageWorker(splitRequest, new Time(0, 0, 0))
          },
          error: (e) => this.addErrorMessage(`Logs from ${this.channel} on ${this.date} are not available.`, e)
        })
        this.fetchEmoteSet();
      },
      error: (e) => this.addErrorMessage(`Could not retrieve data about ${this.channel}`, e)
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
      const messageData = msg.data.content;
      const messageTime: Time = new Time(
        messageData.time.hours,
        messageData.time.minutes,
        messageData.time.seconds,
        messageData.time.milliseconds);
      if (!this.draggingSlider) //don't sync time if dragging slider
        this.sliderValueMinutes = messageTime.hours * 60 + messageTime.minutes;
      const message: Message = new Message(
        messageData.date,
        messageTime,
        messageData.channel,
        messageData.author,
        messageData.content);
      this.addMessage(message);
    }
  }

  onDragStart() {
    this.draggingSlider = true;
  }

  messageWorker(messages: any, time: any): void {
    this.timerWorker.postMessage({ messages: messages, time: time })
  }

  updateCurrentTime(): void {
    let t: Time = new Time();
    t = Time.convertMsToTime(this.sliderValueMinutes * 60 * 1000);
    this.addMessage(new Message("", new Time(), "", "SERVER", `Showing messages from: ${t.toShortString()}`));
    this.timerWorker.postMessage({ time: t });
    this.draggingSlider = false;
  }

  formatSliderTimeLabel(value: number): string {
    let t = new Time();
    t = Time.convertMsToTime(value * 60 * 1000);
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
    if (this.channel == this.userData.name) return;
    this.messages = [];
    this.getChannelData();
  }

  playMessageSfx() {
    const audio = new Audio();
    audio.src = "../../../assets/pop.mp3";
    audio.load();
    audio.volume = 0.2;
    audio.play();
  }

  fetchEmoteSet(): void {
    this.emoteSet = [];
    const emoteSetRequests: { emoteSetName: string, emoteRequest: Observable<Emote[]> }[] = [];

    emoteSetRequests.push({ emoteSetName: "BTTV global", emoteRequest: this.emoteSetService.getBttvGlobalEmotes() });
    emoteSetRequests.push({ emoteSetName: "7TV global", emoteRequest: this.emoteSetService.get7TvGlobalEmotes() });
    emoteSetRequests.push({ emoteSetName: "Twitch global", emoteRequest: this.emoteSetService.getTwitchGlobalEmotes() });
    emoteSetRequests.push({ emoteSetName: "BTTV user", emoteRequest: this.emoteSetService.getBttvUserEmotes(this.userData.twitch_id) });
    emoteSetRequests.push({ emoteSetName: "7TV user", emoteRequest: this.emoteSetService.get7TvUserEmotes(this.userData.twitch_id) });
    emoteSetRequests.push({ emoteSetName: "Twitch user", emoteRequest: this.emoteSetService.getTwitchUserEmotes(this.userData.twitch_id) });

    emoteSetRequests.forEach(r => r.emoteRequest.pipe(take(1)).subscribe({
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
      //disable autoscroll if scrolled up
      if (this.myScrollContainer.nativeElement.scrollTop < 0) return;
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { console.error(err); }
  }
}

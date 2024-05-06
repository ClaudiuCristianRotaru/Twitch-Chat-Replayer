import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { EmotifyPipe } from '../pipes/emotify.pipe';
import { EmoteSetService } from '../services/emote-set.service';
import { take } from 'rxjs';
import { Emote } from '../models/emote';
import { ChatReplayer } from '../logic/chat-replayer';
import { Message } from '../models/message';
import { FormsModule } from '@angular/forms';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, EmotifyPipe, FormsModule],
  providers: [EmotifyPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {

  readonly userColors: string[] = ['red', 'green', 'turquoise', 'pink', 'limegreen', 'orange', 'burlywood', 'lightgray'];
  readonly MAX_DISPLAYED_MESSAGES: number = 100;

  sliderValueMinutes: number = 20;
  title = 'chat-replay-frontend';
  emoteSet: Emote[] = [];
  messages: Message[] = [];
  userId: string = "96858382"
  replayer: ChatReplayer = new ChatReplayer();
  channel: string = "erobb221";
  date: string = "2024/4/18";
  constructor(private emoteSetService: EmoteSetService) { }

  ngOnInit(): void {
    console.log("ngOnInit() called.")
    this.fetchEmoteSet();
  }

  placeholderClick() {
    console.log('update');
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

}

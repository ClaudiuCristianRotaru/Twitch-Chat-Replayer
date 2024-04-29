import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { EmotifyPipe } from '../pipes/emotify.pipe';
import { EmoteSetService } from '../services/emote-set.service';
import { take } from 'rxjs';
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, EmotifyPipe],
  providers: [EmotifyPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'chat-replay-frontend';
  emoteSet: string[] = ["123", "e2wr", "erf1"];
  comments: string[] = [];
  i: number = 0;

  constructor(private emoteSetService: EmoteSetService) { 
    emoteSetService.getBttvEmotes().pipe(take(1)).subscribe(res => {
      res.channelEmotes.forEach(emote=>{
        this.emoteSet.push(emote.code);
      })
    });
    console.log(this.emoteSet);
    this.comments = ["53","58","testi2ng KKomrade 357f7 tahhhhhh1hh2hhhhhhhhhhhh Lemao Juicers nrjkg1fn2rejgner e2wr m2ew rm2wek rew2mkr ewmrew2kl r1werfnsdafn2dsjk1vnfjwlfkbre ffe1r2er fnke1r fe2rf erf1 er1f2re ", "325", "^$363346", "646","8686"];
  }

  update() {
    this.i++;
    this.comments.splice(0,0,this.i.toString());
    if (this.comments.length > 100 ) this.comments.splice(this.comments.length-1,1);
  }
}

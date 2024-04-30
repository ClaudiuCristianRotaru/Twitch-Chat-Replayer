import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { EmotifyPipe } from '../pipes/emotify.pipe';
import { EmoteSetService } from '../services/emote-set.service';
import { take } from 'rxjs';
import { Emote } from '../models/emote';
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
  emoteSet: Emote[] = [];
  comments: string[] = [];
  i: number = 0;
  userId: string = "96858382" 
  constructor(private emoteSetService: EmoteSetService) { 
    //this.emoteSet = emoteSetService.getBttvEmotes()
    console.log('1');
    this.getAllEmotes();
    this.comments = ["wonkyWheel :tf: reckH Lemao puase wonkyWheel wonkyWheel LimeD Limeciety DTG puase wonkyWheel LuL ClownFi PegChamp wonkyWheel puase wonkyWheel wonkyWheel puase wonkyWheel  WonkyWheel WONKYWHEEL wonkyD","58","testi2ng KKomrade 357f7 tahhhhhh1hh2hhhhhhhhhhhh Lemao Juicers nrjkg1fn2rejgner e2wr m2ew rm2wek rew2mkr ewmrew2kl r1werfnsdafn2dsjk1vnfjwlfkbre ffe1r2er fnke1r fe2rf erf1 er1f2re ", "325", "^$363346", "646","8686"];
  }

  update() {
    this.i++;
    this.comments.splice(0,0,this.i.toString());
    if (this.comments.length > 100 ) this.comments.splice(this.comments.length-1,1);
  }

  async getAllEmotes() {
    this.emoteSetService.getBttvUserEmotes(this.userId).pipe(take(1)).subscribe(r=>{
      this.emoteSet = this.emoteSet.concat(r);
    });
    this.emoteSetService.getBttvGlobalEmotes().pipe(take(1)).subscribe(r=>{
      this.emoteSet = this.emoteSet.concat(r);
    });

    this.emoteSetService.get7TvUserEmotes(this.userId).pipe(take(1)).subscribe(r=>{
      this.emoteSet = this.emoteSet.concat(r);
    });;

    this.emoteSetService.get7TvGlobalEmotes().pipe(take(1)).subscribe(r=>{
      this.emoteSet = this.emoteSet.concat(r);
    });
  }
}

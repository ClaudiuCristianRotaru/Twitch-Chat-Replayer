import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'chat-replay-frontend';
  emoteSet: string[] = ["13", "17"];
  comments: string[] = [];
  i: number = 0;

  constructor( ) { 
    this.comments = ["53","58","testi2ng 123 35727 tahhhhhh1hh2hhhhhhhhhhhh j2e j2 nrjkg1fn2rejgner e2wr m2ew rm2wek rew2mkr ewmrew2kl r1werfnsdafn2dsjk1vnfjwlfkbre ffe1r2er fnke1r fe2rf erf1 er1f2re ", "325", "^$363346", "646","8686"];
  }

  update() {
    this.i++;
    this.comments.splice(0,0,this.i.toString());
    if (this.comments.length > 100 ) this.comments.splice(this.comments.length-1,1);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'chat-replay-frontend';

  comments: string[] = [];
  i: number = 0;

  constructor( ) { 
    this.comments = ["53","58","123"];
  }

  update() {
    console.log(this.comments)
    console.log(this.i);
    this.i++;
    this.comments.splice(0,0,this.i.toString());
    if (this.comments.length > 10 ) this.comments.splice(this.comments.length-1,1);
  }
}

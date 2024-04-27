import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  standalone: true,
  name: 'emotify'
})
export class EmotifyPipe implements PipeTransform {

  constructor(private _domSanitizer: DomSanitizer) { }

  transform(value: string, emoteSet: string[]): SafeHtml {
    return this._domSanitizer.bypassSecurityTrustHtml(this.replaceKeywordsWithImgs(value, emoteSet));
  }

  private replaceKeywordsWithImgs(message: string, emoteSet: string[]): string {
    if (!message || message.length <= 0)
      return message;

    let finalHTML: string = '<span>';
    for (let word of message.split(" ")) {
      if (emoteSet.includes(word)) {
        let classAttribute: string = `"emote"`;
        let styleAttribute: string = `"height:32px; aspect-ratio:59/32; background-image:url(https://cdn.7tv.app/emote/657b4b203f09da03badb9378/1x.webp);"`
        finalHTML += `<span style=${styleAttribute} class=${classAttribute}></span>`
        finalHTML += `<span> `; 
      }
      else { 
        finalHTML += word + " "; 
      }
    }
    finalHTML += "</span>"
    return finalHTML;


  }

}

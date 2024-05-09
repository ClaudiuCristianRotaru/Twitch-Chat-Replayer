import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Emote } from '../models/emote';

@Pipe({
  standalone: true,
  name: 'emotify'
})
export class EmotifyPipe implements PipeTransform {

  constructor(private _domSanitizer: DomSanitizer) { }

  transform(value: string, emoteSet: Emote[]): SafeHtml {
    return this._domSanitizer.bypassSecurityTrustHtml(this.replaceKeywordsWithImgs(value, emoteSet));
  }

  private replaceKeywordsWithImgs(message: string, emoteSet: Emote[]): string {
    if (!message || message.length <= 0)
      return message;

    let finalHTML: string = '<span>';
    let splitMessage: string[] = message.split(" ");
    for (let word of splitMessage) {
      let selectedEmote: Emote | undefined = this.findWordInEmoteSet(word, emoteSet);
      if (selectedEmote != undefined) {
        finalHTML += "</span>";
        finalHTML += this.buildReplacementSpan(selectedEmote);
        finalHTML += "<span>";
      }
      else {
        finalHTML += word + " ";
      }
    }
    finalHTML += "</span>"
    return finalHTML;
  }

  private findWordInEmoteSet(word:string, emoteSet:Emote[]) {
    let index = 0;
    while (index < emoteSet.length) {
      if (word == emoteSet[index].name) {
        return emoteSet[index];
      }
      index++;
    }
    return undefined;
  }

  private buildReplacementSpan(selectedEmote:Emote): string {
    let replacementSpan: string=""
    let classAttribute: string = `emote`;
    let height: any = 32;
    let width: any = 32;
    
    if (selectedEmote.height) height = selectedEmote.height;
    if (selectedEmote.width) width = selectedEmote.width;

    let styleAttribute: string = `"height:32px; aspect-ratio:${width}/${height}; background-image:url(${selectedEmote.url});"`
    replacementSpan += `<span style=${styleAttribute} class="${classAttribute}"></span>`

    return replacementSpan;
  }
}

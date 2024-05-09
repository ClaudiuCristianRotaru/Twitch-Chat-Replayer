import { Time } from "../logic/time";

export class Message
{
    date:string;
    time:Time;
    channel:string;
    author:string;
    content:string;
    constructor(date:string, time:Time, channel: string, author:string, content:string) {
        this.date = date;
        this.time = time;
        this.channel = channel;
        this.author = author;
        this.content = content;
    }

    
    toString(): string {
        return `[${this.date} ${this.time.toString()}] #${this.channel} ${this.author}: ${this.content}`;
    }
}
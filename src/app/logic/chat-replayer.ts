import { Time } from "../logic/time";
import { Message } from "../models/message";

export class ChatReplayer {
    position: number = 0 ;
    startTime: Time = new Time();
    messages: Message[] = [];
    constructor() {
    }

    convertStringtoMessage(line: string) {
        if (line.length == 0) return;

        const splitLine: string[] = line.split(" ");
        //line format
        //[YYYY-MM-DD HH:MM:SS] #channel author: content
        const date:string = splitLine[0].substring(1, "YYYY-MM-DD]".length);
        const time:string = splitLine[1].substring(0, "HH:MM:SS".length);
        const channel:string = splitLine[2].substring(1);
        const author:string = splitLine[3].substring(0, splitLine[3].length - 1);
        let content:string = "";

        for (let i = 4; i< splitLine.length; i++) {
            content = content + splitLine[i] + " ";
        }

        const splitTime: number[] = time.split(":").map(x => Number.parseInt(x)); 

        const message = new Message(date,new Time(splitTime[0], splitTime[1], splitTime[2]),channel,author,content);
        this.messages.push(message);
    }

    getCurrentMessageInQueue(): void { 
        this.position = 0;
        this.messages.forEach(message => {
            if(message.time.compare(this.startTime) < 0) {
                this.position++;
            }
        });
    }

    getTopMessageString(): string {
        return `[${this.messages[this.position].time.toShortString()}] ${this.messages[this.position].author}: ${this.messages[this.position].content}`;
    }

    getTopMessage(): Message {
        return this.messages[this.position];
    }

    doesTimeMatch(currentTime:Time): boolean {
        return (
            currentTime.hours == this.messages[this.position].time.hours &&
            currentTime.minutes == this.messages[this.position].time.minutes &&
            currentTime.seconds == this.messages[this.position].time.seconds &&
            currentTime.milliseconds == this.messages[this.position].time.milliseconds
        )
    }

}
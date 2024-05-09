export class Time {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
    constructor(hours: number = 0, minutes: number = 0, seconds: number = 0, milliseconds: number = 0) {
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
        this.milliseconds = milliseconds;
    }

    add(newTime: Time): Time {
        return this.convertMsToTime(newTime.convertTimeToMs() + this.convertTimeToMs());
    }

    convertTimeToMs(): number {
        return this.milliseconds + this.seconds * 1000 + this.minutes * 60 * 1000 + this.hours * 60 * 60 * 1000;
    }

    convertMsToTime(ms:number): Time {
        return new Time(
        Math.floor((ms / (1000 * 60 * 60))),
        Math.floor((ms / (1000 * 60)) % 60),
        Math.floor((ms / 1000) % 60),
        Math.floor(ms % 1000)
        );
    }

    compare(newTime:Time ): number {
        if (this.convertTimeToMs() == newTime.convertTimeToMs()) return 0
        let returnVal = this.convertTimeToMs() < newTime.convertTimeToMs()? -1 : 1;
        return returnVal;
    }

    toString(): string { 
        return `${this.hours}:${this.minutes}:${this.seconds}:${this.milliseconds}`;
    }
    
    toShortString(): string {
        return `${this.hours<10?"0"+this.hours:this.hours}:${this.minutes<10?"0"+this.minutes:this.minutes}:${this.seconds<10?"0"+this.seconds:this.seconds}`;
    }

}
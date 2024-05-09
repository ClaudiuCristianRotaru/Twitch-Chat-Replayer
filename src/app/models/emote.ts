export class Emote {
    constructor(name: string , url: string, width: number = 0, height: number = 0) {
        this.name = name;
        this.url = url;
        this.height = height;
        this.width = width;
    }
    name: string;
    url: string;
    width?: number;
    height?: number;
}
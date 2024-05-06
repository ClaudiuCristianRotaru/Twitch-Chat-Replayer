export interface SevenTvEmote {
    id: string;
    name: string;
    width?: number;
    height?: number;
    data:{ host: {files:[{height: number, width: number}]}};
}
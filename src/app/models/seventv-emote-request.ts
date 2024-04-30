export interface SevenTvEmote {
    id: string;
    name: string;
    width?: number;
    height?: number;
    data:{ host: {files:[{height: number, width: number}]}};
}

export interface SevenTvEmoteRequest {
    id: string;
    emote_set: {emotes: SevenTvEmote[]};
}
export interface BttvEmote {
    id: string;
    code: string;
    width?: number;
    height?: number;
}

export interface BttvEmoteRequest {
    id: string;
    channelEmotes: BttvEmote[];
    sharedEmotes: BttvEmote[];
}
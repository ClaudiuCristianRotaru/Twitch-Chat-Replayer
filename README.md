# ChatReplay
Replay twitch chat logs from the desired date and timestamp
# Logs Provider
Uses chat logs provided by https://logs.ivr.fi/

The time at which the messages are posted and the timestamp progress bar are based on GMT(UTC+0).

The accessibilty and timeframe of stored logs will greatly differ on a per channel basis.
# Emotes
Fetches global and channel specific emotes from the following providers:
- Twitch Helix
- BTTV
- FFZ
- 7TV
  
Subscriber and personal-use emotes are not (yet?) implemented

**Important: Twitch API credentials**

Twitch emotes require client credientials in the forms of a CLIENT_ID and CLIENT_SECRET stored as strings in a config.ts file. More info about twitch client credentials grant flow [**here**](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow)

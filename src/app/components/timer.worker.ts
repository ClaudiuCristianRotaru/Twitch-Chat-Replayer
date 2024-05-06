/// <reference lib="webworker" />
import { ChatReplayer } from "../logic/chat-replayer";
import { Time } from "../logic/time";

let currentTime: Time = new Time();
let replayer: ChatReplayer = new ChatReplayer();
let inter: any;

addEventListener('message', (e) => {
    console.log("Initialized worker with data:");
    console.log(e);

    if (e.data.messages) {
        console.log("Setting worker messages");
        e.data.messages.forEach((message: string) =>
            replayer.convertStringtoMessage(message));
    }

    if (e.data.time) {
        console.log("Setting worker current time");
        setTime(e.data.time);
    }

    if (!inter) {
        console.log("Starting new worker interval");
        inter = setInterval(ping, 20);
    }
});

function ping() {
    currentTime = currentTime.add(new Time(0, 0, 0, 20));

    if (!replayer.doesTimeMatch(currentTime)) return;

    postMessage({status: "inprogress", content: replayer.getTopMessage()});
    replayer.position++;
    if (replayer.position == replayer.messages.length) {

        postMessage({status: "finished", content: `End of today's chat logs`});
        replayer.position = 0;
    }

}

function setTime(time: any) {
    currentTime = new Time(time.hours, time.minutes, time.seconds, time.milliseconds);
    console.log(currentTime);
    replayer.startTime = currentTime;
    replayer.getCurrentMessageInQueue();
}
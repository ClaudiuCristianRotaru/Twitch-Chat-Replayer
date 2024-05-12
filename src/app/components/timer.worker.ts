/// <reference lib="webworker" />
import { ChatReplayer } from "../logic/chat-replayer";
import { Time } from "../logic/time";

let currentTime: Time = new Time();
let replayer: ChatReplayer = new ChatReplayer();
let repeatingInterval: any;
let ms: number = 1000;
let expected = Date.now();
addEventListener('message', (e) => {
    console.log("Initialized worker with data:");
    console.log(e);

    if (e.data.messages) {
        replayer.messages = [];
        console.log("Setting worker messages");
        e.data.messages.forEach((message: string) =>
            replayer.convertStringtoMessage(message));
    }

    if (e.data.time) {
        console.log("Setting worker current time");
        setTime(e.data.time);
    }
    console.log(repeatingInterval);
    if (!repeatingInterval) {
        console.log("Starting new worker interval");
        repeatingInterval = setTimeout(tick, ms);
    }
});

function tick() {
    let dt = Date.now() - expected;
    if( dt > ms) {
        console.error("Time is desyncing")
    }
    while (replayer.doesTimeMatch(currentTime))
    {
    postMessage({status: "inprogress", content: replayer.getTopMessage()});
    replayer.position++;
    checkQueueEnd();
    }
    currentTime = currentTime.add(new Time(0, 0, 0, 1000));
    expected += ms;
    setTimeout(tick,Math.max(0,ms-dt));
}

function setTime(time: any) {
    currentTime = new Time(time.hours, time.minutes, time.seconds, time.milliseconds);
    replayer.startTime = currentTime;
    replayer.getCurrentMessageInQueue();
    checkQueueEnd();
}

function checkQueueEnd() {
    if (replayer.position == replayer.messages.length) {

        postMessage({status: "finished", content: `End of today's chat logs`});
        replayer.position = 0;
    }
}
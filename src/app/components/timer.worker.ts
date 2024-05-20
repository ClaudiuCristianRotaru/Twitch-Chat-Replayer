/// <reference lib="webworker" />
import { ChatReplayer } from "../logic/chat-replayer";
import { Time } from "../logic/time";


const replayer: ChatReplayer = new ChatReplayer();
const ms: number = 1000;
let currentTime: Time = new Time();
let isLoopActive: boolean = false;
let expected = Date.now();

addEventListener('message', (e) => {

    if (e.data.messages) {
        replayer.messages = [];
        e.data.messages.forEach((message: string) =>
            replayer.convertStringtoMessage(message));
    }

    if (e.data.time) {
        expected = Date.now();
        setTime(e.data.time);
    }

    if (!isLoopActive) {
        isLoopActive = true;
        setTimeout(tick, ms);
    }
});

function tick() {
    const dt = Date.now() - expected;
    if (dt > ms) {
        console.error("Time might be desyncing");
    }
    while (replayer.doesTimeMatch(currentTime)) {
        postMessage({ status: "inprogress", content: replayer.getTopMessage() });
        replayer.position++;
        checkQueueEnd();
    }
    currentTime = currentTime.add(new Time(0, 0, 0, 1000));
    expected += ms;
    if (!isLoopActive) return; 
    setTimeout(tick, Math.max(0, ms - dt));
}

function setTime(time: {hours: number, minutes:number, seconds:number, milliseconds:number}) {
    currentTime = new Time(time.hours, time.minutes, time.seconds, time.milliseconds);
    replayer.startTime = currentTime;
    replayer.getCurrentMessageInQueue();
    checkQueueEnd();
}

function checkQueueEnd() {
    if (replayer.position == replayer.messages.length) {
        isLoopActive = false;
        postMessage({ status: "finished", content: `End of today's chat logs` });
        replayer.position = 0;
    }
}
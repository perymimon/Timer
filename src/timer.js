const DONE = Symbol('Done');
const THEN_QUEUE = Symbol('then queue');
const TICK_QUEUE = Symbol('tick queue');
const DEBUG_NAME = Symbol('debug name');
const STOP_TICKS = Symbol('cool notify timer');

export default class Timer {
    constructor(time, callback, autostart) {
        this.orginalTime = this.time = time;
        this.callback = callback;
        this.timer = null;
        this[THEN_QUEUE] = [];
        this[TICK_QUEUE] = [];
        this[STOP_TICKS] = [];
        this.finishedCounter = 0;
        autostart && this.restart();
    }

    debug(name) {
        this[DEBUG_NAME] = name;
    }

    stop(whenStop = 1, lastTick = true) {
        this.pause();
        this.endTime = this.startTime + whenStop * this.time;
        lastTick && lastTimeNotify.call(this);
        this[DEBUG_NAME] && console.log('timer', this[DEBUG_NAME], ':stop');
    }

    setTime(newTime) {
        this.time = newTime;
        this.orginalTime = newTime;
    }

    restart() {
        clearTimeout(this.timer);
        coolNotify.call(this);
        this[DONE] = false;
        this.startTime = Date.now();
        this.endTime = this.startTime;

        this.timer = setTimeout(() => {
            this.finishedCounter++;
            this.stop();
            this.endTime = this.startTime + this.time;
            this[DONE] = true;
            this.callback && this.callback();
            lastTimeNotify.call(this);
            runThenableQueue.call(this);
        }, this.time);

        igniteAllNotify.call(this);

    }

    pause() {
        this[DEBUG_NAME] && console.log('timer', this[DEBUG_NAME], ':pause');
        clearTimeout(this.timer);
        coolNotify.call(this);
        this.timer = null;
        this.endTime = Date.now();

    }

    resume() {
        this[DEBUG_NAME] && console.log('timer', this[DEBUG_NAME], ':resume');
        if (this.timer) return;
        let timePass = this.endTime - this.startTime;
        this.time = this.orginalTime - timePass;
        this.restart();
        this.startTime -= timePass;
        this.time = this.orginalTime;
    }

    tick(time, callback) {
        this[TICK_QUEUE].push([callback, time]);
        const stopNotify = igniteNotify.call(this, callback, time);
        this[STOP_TICKS].push(stopNotify);
    }

    stopTicks() {
        coolNotify.call(this);
        this[TICK_QUEUE] = [];
    }

    get progress() {
        let now = this.timer ? Date.now() : this.endTime;
        let t = ((now - this.startTime) / this.orginalTime);
        return t;
    }

    then(res, rej) {
        this[THEN_QUEUE].push(res);
        if (this[DONE]) {
            runThenableQueue.call(this)
        }
    }
}

function runThenableQueue() {
    this[THEN_QUEUE].forEach(callback => callback());
    this[THEN_QUEUE] = [];
}

function coolNotify() {
    this[STOP_TICKS].forEach(clear => clear());
    this[STOP_TICKS] = [];
}

function igniteNotify(callback, tickTime) {
    let timer;

    const cycle = () => {
        if (!this.timer) return;
        clearTimeout(timer);
        const timePass = ( Date.now() - this.startTime);
        /*align the tick notification slots with the progress of the timer*/
        const timeLeft = tickTime - (timePass % tickTime);
        timer = setTimeout(() => {
            requestAnimationFrame(function () {
                callback();
                cycle();
            })
        }, timeLeft)
    }

    cycle();

    return /*stopTimer*/()=> clearTimeout(timer);
}

function lastTimeNotify() {
    this[TICK_QUEUE].forEach(([callback]) => callback());
}

function igniteAllNotify() {
    this[STOP_TICKS] = this[TICK_QUEUE].map(args => igniteNotify.apply(this, args));
    return  this[STOP_TICKS];
}

/**--------------SIMPLE TIMER------------------**/
export function simpleTimer(callback, time) {
    var cancel = setTimeout(callback, time);
    return function () {
        clearTimeout(cancel);
    }

}
## TIMER

 battle tested EC6 micro lib that implement useful `timer`. 
 The `Timer` notifies on each x ms and use as a thenable object (behave like a promise ) 
 that resolve when time done 
 

## Example
```
import Timer from 'timer'
const timer = new Timer(10 * 1000, function onEnd(){
    // called when time end

})

timer.tick( _=>{
    // call thick every 1000ms
    console.log(`${timer.progress()} progress`);
}, 1000) 

timer.start();

await timer;
console('timer done')

```

## Methods
### constructor(time:number(ms), callback:fn, autostart:boolean): timer
time is the time 
    
### setTime( newTime: number(ms))
 set timer duration

### restart()
 stop and restart the timer, it not trigger end promise;

### pause()
stop the timer, stop to notify about the pastime. 
remember the progress and continue it after calls `resume()`

### resume()  
resume timer after a pause.
not ops when call when timer already work. 

### tick(cb:fn, time:number(ms))
trigger the callback every `time`ms and in the end of the timer run

### get progress : number (0-100)
return the progress of the timer in percentage 




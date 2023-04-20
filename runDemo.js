const LedMatrix = require('easybotics-rpi-rgb-led-matrix')
let matrix = new LedMatrix(16,64,1,1,100,"adafruit-hat")
const font = "./fonts/6x13.bdf"

let today = new Date(Date.UTC(2022, 9, 16, 12, 0))
let yesterday = new Date(Date.UTC(2022, 9, 15, 12, 0))
let numericalToday = (today.toISOString()).slice(0,10)
let numericalYesterday = (yesterday.toISOString()).slice(0,10)

let birthdate = new Date(Date.UTC(96, 4, 12, 4, 45, 0)-18000000)
const videoDurations = require(`./data/${numericalToday}.json`)

let videoTotalToday = videoDurations.durationLog[numericalToday]
// videoTotalToday = (833567904060 + 1440*60*1000*3)
let videoTotalYesterday = videoDurations.durationLog[numericalYesterday]
// videoTotalYesterday = (833481504060-10000)
console.log(videoTotalToday,videoTotalYesterday)
// 0. Get lifeTotalToday and lifeTodayYesterday, which is the difference of time today/yesteday and birthdate
let lifeTotalToday = today - birthdate
console.log("life total today: ", lifeTotalToday)
let lifeTotalYesterday = yesterday - birthdate
console.log("life total yesterday: ", lifeTotalYesterday)

// 1. Get differenceToday, which is difference of time between lifeTotalToday and videoTotalToday
let differenceToday = lifeTotalToday - videoTotalToday 
// 2. Get differenceYesterday, which is difference of time between lifeTotalYesterday and videoTotalYesterday
let differenceYesterday = lifeTotalYesterday - videoTotalYesterday
console.log(differenceYesterday, differenceToday)
// 3. Get dailyProgress, which is the difference of time between differenceYesterday from differenceToday (dT - dY)
// ideally, it will be below 0 (meaning that the difference is smaller got closer to 0 total difference)
let dailyProgress = differenceToday-differenceYesterday-(2160000000)
let posProgress = dailyProgress < 0
console.log(posProgress)

// 4. Get dailyProgressAbs, which is the absolute value of dailyProgress
let dailyProgressAbs = Math.abs(dailyProgress)
// 5. Get incrementToday, which is dailyProgressAbs/length of a day, will give you the factor of increase/decrease
let incrementToday = dailyProgressAbs/86400000
// 6. Set clockToday to the value of differenceYesterday



let timerInterval = (1000/incrementToday)
let numberOfIntervals = Math.floor(86400000/timerInterval)

console.log(timerInterval)
console.log(numberOfIntervals)

//set the clock to the difference in time yesterday
const clockToday = differenceYesterday
//also set a clockCalc variable that we'll increment
let clockCalc = clockToday
console.log("heres clock calc", clockCalc)


let red = [255,0,0]
let green = [0,255,0]

function updateTime (){
    console.log("hello")
    let color = clockCalc < 0 ? "green" : "red"
    //NEED TO INSERT WIN CONDITION HERE
    //ALSO NEED TO SOLVE FOR NEGATIVE NUMBERS
    
    //get the amount of days in the clock, which is the floor of days
    //get the amount of hours after
    
    var d = Math.floor(clockCalc / (1000 * 60 * 60 * 24))
    var dInMs = d * 86400000
    var h = Math.floor((clockCalc % dInMs)/(1000*60*60))
    var hInMs = h * (86400000/24)
    var m = Math.floor((clockCalc % (dInMs + hInMs)) / (1000*60))
    var mInMs = m * (60000)
    var s = Math.floor((clockCalc % (dInMs + hInMs + mInMs)) / 1000) 
    if (d.toString().length == 1) {
	d = `00${d}`
    }
    if (d.toString().length == 2) {
	d = `0${d}`
    }
    if (h.toString().length == 1) {
	h = `0${h}`
    }
    if (m.toString().length == 1) {
	m = `0${m}`
    }
    if (s.toString().length == 1) {
	s = `0${s}`
    } 
    let input = `${d}:${h}:${m}:${s}`
    matrix.clear()
    matrix.drawText(1,2,input,font,...red)
    matrix.update()
   //hours is the remainder of time of clockToday % days in ms
    posProgress ? clockCalc -= 1000 : clockCalc += 1000
    console.log(`Status: ${color} | Days: ${Math.abs(d)} | Hours ${Math.abs(h)} | Minutes ${Math.abs(m)} | Seconds ${Math.abs(s)}`)
}


// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms))

async function load () { // We need to wrap the loop into an async function for this to work
  for (var i = 0; i < numberOfIntervals; i++) {
    updateTime();
    console.log(clockCalc)
    // setTimeout(updateTime, timerInterval);
    await timer(timerInterval); // then the created Promise can be awaited
  }
}

load();





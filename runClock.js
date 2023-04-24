const addZeros = (timeUnit, isDay = false) =>  {
  const totalLength = isDay ? 3 : 2
  timeUnit = timeUnit.toString()
  while (timeUnit.length < totalLength) {
    timeUnit = `0${timeUnit}`
  }
  return timeUnit
}
const getTimeUnits = (timeVal) => {
  let d = Math.floor(timeVal / (1000 * 60 * 60 * 24))
  let dInMs = d * 86400000
  // console.log("time mins d in ms", timeVal - dInMs, d)
  // console.log("time mod  d in ms", timeVal % dInMs)
  // console.log(Math.floor((timeVal % dInMs)))
  let h = Math.floor((timeVal - dInMs)/(1000*60*60))
  let hInMs = h * (86400000/24)
  let m = Math.floor((timeVal - (dInMs + hInMs)) / (1000*60))
  let mInMs = m * (60000)
  let s = Math.floor((timeVal -(dInMs + hInMs + mInMs)) / 1000) 
  d = addZeros(d, true)
  h = addZeros(h)
  m = addZeros(m)
  s = addZeros(s)
  // console.log(d,m,h,s)
  return {d, h, m, s}
}

const dayLength = (1000 * 60 * 60 * 24)
const today = new Date(Date.now())
const yesterday = new Date(today - dayLength)
const numericalToday = (today.toISOString()).slice(0,10) //202X-MM-DD
const numericalYesterday = (yesterday.toISOString()).slice(0,10)//202X-MM-DD

const birthdate = new Date(Date.UTC(96, 4, 12, 4, 45, 0)-18000000)
const videoDurations = require(`./data/${numericalToday}.json`)

const timeAliveToday = today - birthdate
const timeAliveYesterday = yesterday - birthdate

// get the video totals from today and yesterday
const viewTimeToday = videoDurations.durationLog[numericalToday]// + (1440 * 1000 * 60 * 1000)
// // const videoTotalToday = videoDurations.durationLog[numericalToday]// + (1440 * 1000 * 60 * 1000)
// const viewTimeYesterday = viewTimeToday - (dayLength*3)
const viewTimeYesterday = videoDurations.durationLog[numericalYesterday]

// const viewTimeToday = timeAliveToday + (dayLength * 2879)// + (1440 * 1000 * 60 * 1000)
// const videoTotalToday = videoDurations.durationLog[numericalToday]// + (1440 * 1000 * 60 * 1000)
// const viewTimeYesterday = timeAliveYesterday - (dayLength*1)


// subtract lifeTimeToday from viewTimeToday to get distanceToday
let distanceToday = viewTimeToday - timeAliveToday
console.log("distance today:", distanceToday)
// subtract lifeTimeYesterday from viewTimeYesterday to get distanceYesterday
let distanceYesterday = viewTimeYesterday - timeAliveYesterday
console.log("distance yesterday:", distanceYesterday)

// subtract distanceYesterday from distanceToday to get distanceMovement
let distanceMovement = distanceToday - distanceYesterday || 1
console.log("distanceMovement", distanceMovement)

// goal is to take a day to modify 'distanceYesterday' a 'distanceMovement' amount in increments of 1000

// we can get how many increments of 1000 by dividing distanceMovement by 1000
let numIncrements = distanceMovement / 1000
if (numIncrements > -1 && numIncrements < 1) numIncrements = 1
console.log('numIncrements', numIncrements)
// seconds per incremenet (aka interval) = seconds in a day / increments
let interval = Math.abs((60 * 60 * 24) / numIncrements)
console.log('interval in s', interval)
// multiply interval by 1000 to get msInterval
let msInterval = interval*1000

// every msInterval, increment distanceYesterday by 1000
// if distanceToday > distanceYesterday, increment it up
// if distanceToday < distanceYesterday, incremenet it down
let increment = 1000
while (msInterval < 20) {
  increment = increment * 2
  msInterval = msInterval * 2
}

let red = [255,0,0]
let green = [0,255,0]

const iterate = setInterval(() => {
  distanceMovement >= 0 ? distanceYesterday += increment : distanceYesterday -= increment
  let color = distanceYesterday > 0 ? green : red
  console.log(distanceYesterday)
  const {d, h, m, s} = getTimeUnits(Math.abs(distanceYesterday))
  let input = `${color}  ${d}:${h}:${m}:${s}`
  
  // matrix.clear()
  // matrix.drawText(1,2,input,font,...color)
  // matrix.update()
  
  console.log(input)
}, msInterval)
// then display distanceYEsterday

// which we can consider movementSinceYesterdaySeconds

// movement since yesterday is in ms
// day is also in ms
//function takes an array of IDs
//loops through
//makes request for data for each one
//if data is valid (bigger than )
require('dotenv').config();


const { duration } = require('moment')
const fetch = require('node-fetch')
const fs = require('fs');

//time stuff
//EDT is 5 hours behind GMT, or 18000000ms
let today = new Date(Date.now()-18000000)
//yesterday is same logic but with an extra 86400000ms bc that's how much is in a day
let yesterday = new Date(Date.now()-104400000)
let numericalToday = (today.toISOString()).slice(0,10)
let numericalYesterday = (yesterday.toISOString()).slice(0,10)
let videoIDs = require('./data/videoIDs/combinedIDs.json')

//shrink array for testing purposes
// videoIDs = videoIDs.slice(0,5)
// var videoDurations = require('./dailyAnalytics/' + numericalYesterday + '_data.json')
// const videoDurations = require(`./data/exampleJSON.json`)
const videoDurations = require(`./data/${numericalYesterday}.json`)
// console.log(videoIDs)



let todaysDurationValue = 0

let undefCount = 0




// "6991937250535689477":{
//     "2022-08-08":{
//         "durationAtDate":31482837,
//         "viewsAtDate":3490
//     },
//     "2022-08-09":{
//         "durationAtDate":31482837,
//         "viewsAtDate":3490
//     }
// }

async function getVideoDurations(videoArray, counter, error = false) {
    // console.log("new run with counter at " + counter + " and undef count of " + undefCount)
    if (error == true) return console.log("ran into error at: " + counter)
    //if counter > videoArray.length, the script is over, save the JSON
    if (counter >= videoArray.length) {
        videoDurations.durationLog[numericalToday] = todaysDurationValue
        //order the object        
        const ordered = Object.keys(videoDurations).sort().reduce(
            (obj, key) => { 
              obj[key] = videoDurations[key]; 
              return obj;
            }, 
            {}
        );
        //stringify it for saving as a JSON
        const durationsToFile = JSON.stringify(ordered)
        //save it
        fs.writeFile('./data/' + numericalToday + '.json', durationsToFile, (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON data is saved.");
        }) 
        return console.log("finished")
    }
    //if there is no error and its not done, wait 5 seconds 
    const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));
    await waitFor(333);
    //definition of the individual video data scraper
    async function indivVideo () {
        let aweme_id = videoIDs[counter]
        console.log(aweme_id, "<- ID")
        const response  = await fetch("https://api.us.tiktok.com/aweme/v1/data/insighs/?tz_offset=-14400&aid=1233&carrier_region=US", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "cookie": process.env.COOKIE,
            "Referer": "https://www.tiktok.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "type_requests=[{\"insigh_type\":\"video_total_duration\",\"aweme_id\":\"" + aweme_id + "\"},{\"insigh_type\":\"video_uv\",\"aweme_id\":\"" + aweme_id + "\"}]",
        "method": "POST"
        });
        const result = await response.json()

        //define todays duration and prior duration, defualt to 0 for falsy info
        let priorDuration = videoDurations?.[aweme_id]?.[numericalYesterday]?.durationAtDate || 0
        let todayDuration = result?.['video_total_duration']?.['value'] || 0
        let priorViews = videoDurations?.[aweme_id]?.[numericalYesterday]?.viewsAtDate || 0
        let todayViews = result?.['video_uv']?.['value'] || 0

        //set pushable values (makes sure that bad/empty data does not sub in for old better data)
        let pushableDuration = todayDuration > priorDuration ? todayDuration : priorDuration
        let pushableViews = todayViews > priorViews ? todayDuration : priorDuration
        
        //increment todays duration
        todaysDurationValue += pushableDuration
        
        //new info constructor
        let TempDataObj = new function() {
            this.durationAtDate = pushableDuration
            this.viewsAtDate = pushableViews
        }
        console.log(aweme_id, TempDataObj)
        //assign the info to the video ID at its date
        if (videoDurations[aweme_id] === undefined) videoDurations[aweme_id] = {}
        videoDurations[aweme_id][numericalToday] = TempDataObj


        if (response.status != 200) {
            error = true
            console.log(response.status)
            console.log(response.content)
        }

    }
    //run the individual video data scaper
    indivVideo()
    //increase the counter
    let newCounter = parseInt(counter)
    newCounter++
    //log the counter
    // console.log(newCounter)
    //throw an error if there was an error
    let newError = error
    //recurseively run getVideoDurations
    getVideoDurations(videoIDs, newCounter, newError)
}

getVideoDurations(videoIDs, 0, false)

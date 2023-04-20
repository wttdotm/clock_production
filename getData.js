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
// const videoDurations = require(`./data/${numericalYesterday}.json`) || {}
const videoDurations = {}
// console.log(videoIDs)

// console.log("cookie: " , process.env)


let todaysDurationValue = 0

let undefCount = 0

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }  

function createFile (finalVideoInfo) {
    if (!finalVideoInfo.durationLog) {
        finalVideoInfo.durationLog = {}
    } 
    finalVideoInfo.durationLog[numericalToday] = null
    finalVideoInfo.durationLog[numericalToday] = todaysDurationValue
    //order the object        
    const ordered = Object.keys(finalVideoInfo).sort().reduce(
        (obj, key) => { 
            obj[key] = finalVideoInfo[key]; 
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

//new info constructor
function TempDataObj (pushableDuration, pushableViews) {
    this.durationAtDate = pushableDuration
    this.viewsAtDate = pushableViews
}

function createEntry (result, aweme_id) {
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
    
    let newInfo = new TempDataObj(pushableDuration, pushableViews)

    console.log("aweme_id: ", aweme_id, "newInfo: ", newInfo)

    //assign the info to the video ID at its date
    if (videoDurations[aweme_id] === undefined) videoDurations[aweme_id] = {}
    videoDurations[aweme_id][numericalToday] = newInfo
}


// fetch("https://api.us.tiktok.com/aweme/v1/data/insighs/?tz_offset=-18000&aid=1233&carrier_region=US", {
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "en-US,en;q=0.9",
//     "content-type": "application/x-www-form-urlencoded",
//     "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-site",
//                passport_csrf_token=de897cfea53df2924bf3d09fe091176f; passport_csrf_token_default=de897cfea53df2924bf3d09fe091176f; uid_tt=4733facdb7eb1bc392ed2b697c5a7bf4e4783b0878b089090707a5ddb1c4f0b8; uid_tt_ss=4733facdb7eb1bc392ed2b697c5a7bf4e4783b0878b089090707a5ddb1c4f0b8; sid_tt=4fa9b66f253627ea5b0a622e31f24071; sessionid=4fa9b66f253627ea5b0a622e31f24071; sessionid_ss=4fa9b66f253627ea5b0a622e31f24071; store-idc=useast5; store-country-code=us; store-country-code-src=uid; tt-target-idc=useast5; tt-target-idc-sign=ikT3Jsm-PRbm6cYW2k5mJ1LMVBfgapq7OWD1MeK9nl-J41EVOb1PlV8ViNX2l5ARfOVqaGflr61RlULoWwliL60HWStTPa0t0pNzBUIPnt0liokMDRjAJYkTYFdy_cmT6XQ_k5HljMk6C-eaNJdS-YloSW-ikbScuBE9gXJmz6AnGObZEB72UB_8K3wYUzB37OOFQjyS7-LT-9dhWt343xdn18LPgoVaBOEyPZJ8OfC6IB_jCrOjx-JixRR3usMjsl-GD-JSYUaUOawjC80QdYihE0PgZMhZJh-OQdpvIm9Y9rp6DrPNSTJlsPtNSamPi1n_x6jNFhLtvW7h94VXeMJO04BFzOWkLOsu6OsvyrVnfVxONNgJqx5hj0akdLvelXk6iqIAXBWMgTnjAzG1nba0PtGL0MVvy9dHrGkLTIHNhQ9S4nCYMWXTVQ0OBDBNPEK5QBD9Vy-RGSBMR6oDfisY3ow00oJ2nBh3JLQZv2AdjuCbmObdrpen-THuXKap; _ttp=2JNPb9MpYIxROROSEeY11fiBfqX; tt_csrf_token=JZu7Te9I-v58qBqez-HlAQvHtWhiSK1HTYt4; tt_chain_token=ZhrTlVoe2Aj06kOXlJMGxA==; _abck=D95B13CC6F8D86EDCDE84345B02BB216~0~YAAQhPY9Fxa+HoKFAQAAO9oEnQkbrLhjSyVqyV9V3J9ID1Dg5GK/VQNHFW2y4W/bJXwakMwxHz28QE5/Fq4LEm6zakzVN+78OFiEj4nrp7IGE5aEdp4Wf9LJfBFoQ3RbOTWKXQpulJy/aB6m0NuMcId/QiXaTDHHgRfJ27LXVQ5abvJEVLYC+VV76poF8GoxRBbO5NmIH/fmKGGdvbnFNm/CuXBYsnSEWCQcz9iq3Rk/tzgaW/USnkdJUNRH2exuC4y4Qk2+9G3UFftzBFcHlPhO8uyz0MFgDZ5takESj30aehOSSD6Mcw0lOlArpxxF7wmzYH/k8y8PcBvPxBxN+lmOf6RFzKqz1GlX2LmZu9eiAf8eV5MaXz07DQnGMoWgmYxf2SWBYwxbMzAIu8ldaZltOIYb4KHP~-1~-1~-1; bm_sz=5D2FD845D9D18F2128DA07F7C94E3BA5~YAAQhPY9Fxm+HoKFAQAAO9oEnRL0C9EjPDztwPtFFEIFLch1iibPc9HjFNxeKr7zoo3gWAtaMrAeFyb/OWoQkhTKyPEMxL5TLVGwJ/QlvGhmLsuWmfEYCBBxe6E7M/+iuj/1CPWaQGbjbPq3beoFCQCa8DIhWr9gtwoE7HvIlSJIYU2TZi8C9PTkihmShoAKL20ohxRh+J+0i/op6BoS1tXq8T/8etRBo4APkiT5zqmlw0KkUNGFui7YfVP+CsSawW2pyrHv0die0xktywzxDK+4vBSFdd5UYyH6ISe4Jxqtokk=~3621189~3491124; sid_guard=4fa9b66f253627ea5b0a622e31f24071|1673376621|5184000|Sat,+11-Mar-2023+18:50:21+GMT; sid_ucp_v1=1.0.0-KGY1NTExMzk3NmQwOWI0NzBiMDNkODYyNmRlMGY2OGE1M2JhNjFhMTMKIAiGiK6K6vekwV4Q7eb2nQYYswsgDDCuqIr0BTgHQPQHEAQaB3VzZWFzdDUiIDRmYTliNjZmMjUzNjI3ZWE1YjBhNjIyZTMxZjI0MDcx; ssid_ucp_v1=1.0.0-KGY1NTExMzk3NmQwOWI0NzBiMDNkODYyNmRlMGY2OGE1M2JhNjFhMTMKIAiGiK6K6vekwV4Q7eb2nQYYswsgDDCuqIr0BTgHQPQHEAQaB3VzZWFzdDUiIDRmYTliNjZmMjUzNjI3ZWE1YjBhNjIyZTMxZjI0MDcx; ak_bmsc=CD8BA1BD435DFA8657AC1E520884071A~000000000000000000000000000000~YAAQhPY9Fwa/HoKFAQAAX+MEnRLOkLVIhXd1pFV/lkJoa7aJ5eWns0kqF2wtNtmRhOghf9+jp9r0YFvPJk5yYieQwOV/WztsznLj8h/7yoVCXOHilo1W+umLQedaLZlrgCuvxhSfl69isXu+Ce4uQy4usngpOebAhlsgd80/LABb5wHMhzCYkl+POb3hRkP27ntJUN3Kcappfx1IGyf/1DZQC9VVsDeYFJyaM5Xwsm0oKD61e0O3pOr3NuxcY7oZ2WcpwyqcO6thSuCbBtmbSW6hlHyFKsG9AZXDH76+J3IhEUYR9kBWoCo46cMLE3FuoGojnD05C4B7lfX3cw1itXYEMkxsHggcawA3I9sTtzOnd9JvokoCJp47DpNo4tjUlT8symuBSEAGZkqC3TY2X1GRBMLSMWd1xUKaLvCLZq7IMxH9G57zDxTdv7RWfButl0TWPcnG2J0n56kSPtI9hPa3czmg8TRAqvFl8z13QuFa6IC/fGcpu24=; bm_sv=1196FD320452DD3A659EB79FF079F6D8~YAAQhPY9F+fBHoKFAQAAS/cEnRInwfJtCpyI4o//rGPL1DBhLyIqTHM2Ejn/YLEPA4r+CAuCstZK3HA852Fhy/m9HUqE9nediZUtqL6XgTrHZOJKXhD7TlupjnrRVz+kMoaAcSkpf/s6cXWarv2G6U3btG8wzP73FNOaDt2EkPzPEQRruD/u3U40CVMawWs6/Kjvcpu0F0U1AG8gnfHf7sOpkJgA2Ei5+JKmeM+2Eat4oA5j6IyPgHygzfSoz0aY~1; cmpl_token=AgQQAPPdF-RMpY68fRkpeV0_-eSsXOyUP6jZYMoXPg; ttwid=1|JkFsjGYAqUh2dUbYn25LoKrMZwQvwGgnLyc6UNlcJs8|1673376629|36fade9a7009b908144e95c75026303e19222fdbb95a1a378d919ce14af549a8; s_v_web_id=verify_lcql8nlx_2tBWQ6tl_ntXs_4Mm9_BwkA_WhS1FnptuBYh; odin_tt=94b8292ac87e3767d2b24039c5dc7524dedfeac9c2640ed1e3a93c4fd61bc53851e45c91544e0b73a336d1febba736ff50740368af6cccf5cbb67c2e51e33f41; msToken=UlbNdzPZ7SzRVJIiXElW3nTs473SW3zpAUw9X5wKpuNCs1I-zBoI4Mul5qjRKYWY4hxvfhnyMKMgYbLYJe2xSV2lRPbj5R1gk0UMVjxdrJt12CI8LbNYROU11nchpmg=
//     "cookie": "passport_csrf_token=de897cfea53df2924bf3d09fe091176f; passport_csrf_token_default=de897cfea53df2924bf3d09fe091176f; uid_tt=4733facdb7eb1bc392ed2b697c5a7bf4e4783b0878b089090707a5ddb1c4f0b8; uid_tt_ss=4733facdb7eb1bc392ed2b697c5a7bf4e4783b0878b089090707a5ddb1c4f0b8; sid_tt=4fa9b66f253627ea5b0a622e31f24071; sessionid=4fa9b66f253627ea5b0a622e31f24071; sessionid_ss=4fa9b66f253627ea5b0a622e31f24071; store-idc=useast5; store-country-code=us; store-country-code-src=uid; tt-target-idc=useast5; tt-target-idc-sign=ikT3Jsm-PRbm6cYW2k5mJ1LMVBfgapq7OWD1MeK9nl-J41EVOb1PlV8ViNX2l5ARfOVqaGflr61RlULoWwliL60HWStTPa0t0pNzBUIPnt0liokMDRjAJYkTYFdy_cmT6XQ_k5HljMk6C-eaNJdS-YloSW-ikbScuBE9gXJmz6AnGObZEB72UB_8K3wYUzB37OOFQjyS7-LT-9dhWt343xdn18LPgoVaBOEyPZJ8OfC6IB_jCrOjx-JixRR3usMjsl-GD-JSYUaUOawjC80QdYihE0PgZMhZJh-OQdpvIm9Y9rp6DrPNSTJlsPtNSamPi1n_x6jNFhLtvW7h94VXeMJO04BFzOWkLOsu6OsvyrVnfVxONNgJqx5hj0akdLvelXk6iqIAXBWMgTnjAzG1nba0PtGL0MVvy9dHrGkLTIHNhQ9S4nCYMWXTVQ0OBDBNPEK5QBD9Vy-RGSBMR6oDfisY3ow00oJ2nBh3JLQZv2AdjuCbmObdrpen-THuXKap; _ttp=2JNPb9MpYIxROROSEeY11fiBfqX; tt_csrf_token=JZu7Te9I-v58qBqez-HlAQvHtWhiSK1HTYt4; tt_chain_token=ZhrTlVoe2Aj06kOXlJMGxA==; _abck=D95B13CC6F8D86EDCDE84345B02BB216~0~YAAQhPY9Fxa+HoKFAQAAO9oEnQkbrLhjSyVqyV9V3J9ID1Dg5GK/VQNHFW2y4W/bJXwakMwxHz28QE5/Fq4LEm6zakzVN+78OFiEj4nrp7IGE5aEdp4Wf9LJfBFoQ3RbOTWKXQpulJy/aB6m0NuMcId/QiXaTDHHgRfJ27LXVQ5abvJEVLYC+VV76poF8GoxRBbO5NmIH/fmKGGdvbnFNm/CuXBYsnSEWCQcz9iq3Rk/tzgaW/USnkdJUNRH2exuC4y4Qk2+9G3UFftzBFcHlPhO8uyz0MFgDZ5takESj30aehOSSD6Mcw0lOlArpxxF7wmzYH/k8y8PcBvPxBxN+lmOf6RFzKqz1GlX2LmZu9eiAf8eV5MaXz07DQnGMoWgmYxf2SWBYwxbMzAIu8ldaZltOIYb4KHP~-1~-1~-1; bm_sz=5D2FD845D9D18F2128DA07F7C94E3BA5~YAAQhPY9Fxm+HoKFAQAAO9oEnRL0C9EjPDztwPtFFEIFLch1iibPc9HjFNxeKr7zoo3gWAtaMrAeFyb/OWoQkhTKyPEMxL5TLVGwJ/QlvGhmLsuWmfEYCBBxe6E7M/+iuj/1CPWaQGbjbPq3beoFCQCa8DIhWr9gtwoE7HvIlSJIYU2TZi8C9PTkihmShoAKL20ohxRh+J+0i/op6BoS1tXq8T/8etRBo4APkiT5zqmlw0KkUNGFui7YfVP+CsSawW2pyrHv0die0xktywzxDK+4vBSFdd5UYyH6ISe4Jxqtokk=~3621189~3491124; sid_guard=4fa9b66f253627ea5b0a622e31f24071%7C1673376621%7C5184000%7CSat%2C+11-Mar-2023+18%3A50%3A21+GMT; sid_ucp_v1=1.0.0-KGY1NTExMzk3NmQwOWI0NzBiMDNkODYyNmRlMGY2OGE1M2JhNjFhMTMKIAiGiK6K6vekwV4Q7eb2nQYYswsgDDCuqIr0BTgHQPQHEAQaB3VzZWFzdDUiIDRmYTliNjZmMjUzNjI3ZWE1YjBhNjIyZTMxZjI0MDcx; ssid_ucp_v1=1.0.0-KGY1NTExMzk3NmQwOWI0NzBiMDNkODYyNmRlMGY2OGE1M2JhNjFhMTMKIAiGiK6K6vekwV4Q7eb2nQYYswsgDDCuqIr0BTgHQPQHEAQaB3VzZWFzdDUiIDRmYTliNjZmMjUzNjI3ZWE1YjBhNjIyZTMxZjI0MDcx; ak_bmsc=CD8BA1BD435DFA8657AC1E520884071A~000000000000000000000000000000~YAAQhPY9Fwa/HoKFAQAAX+MEnRLOkLVIhXd1pFV/lkJoa7aJ5eWns0kqF2wtNtmRhOghf9+jp9r0YFvPJk5yYieQwOV/WztsznLj8h/7yoVCXOHilo1W+umLQedaLZlrgCuvxhSfl69isXu+Ce4uQy4usngpOebAhlsgd80/LABb5wHMhzCYkl+POb3hRkP27ntJUN3Kcappfx1IGyf/1DZQC9VVsDeYFJyaM5Xwsm0oKD61e0O3pOr3NuxcY7oZ2WcpwyqcO6thSuCbBtmbSW6hlHyFKsG9AZXDH76+J3IhEUYR9kBWoCo46cMLE3FuoGojnD05C4B7lfX3cw1itXYEMkxsHggcawA3I9sTtzOnd9JvokoCJp47DpNo4tjUlT8symuBSEAGZkqC3TY2X1GRBMLSMWd1xUKaLvCLZq7IMxH9G57zDxTdv7RWfButl0TWPcnG2J0n56kSPtI9hPa3czmg8TRAqvFl8z13QuFa6IC/fGcpu24=; bm_sv=1196FD320452DD3A659EB79FF079F6D8~YAAQhPY9F+fBHoKFAQAAS/cEnRInwfJtCpyI4o//rGPL1DBhLyIqTHM2Ejn/YLEPA4r+CAuCstZK3HA852Fhy/m9HUqE9nediZUtqL6XgTrHZOJKXhD7TlupjnrRVz+kMoaAcSkpf/s6cXWarv2G6U3btG8wzP73FNOaDt2EkPzPEQRruD/u3U40CVMawWs6/Kjvcpu0F0U1AG8gnfHf7sOpkJgA2Ei5+JKmeM+2Eat4oA5j6IyPgHygzfSoz0aY~1; s_v_web_id=verify_lcql8nlx_2tBWQ6tl_ntXs_4Mm9_BwkA_WhS1FnptuBYh; cmpl_token=AgQQAPPdF-RMpY68fRkpeV0_-eSsXOyUP6jZYMoXLQ; odin_tt=e69c93d99d01fcfda2042536617a36564927b797d1cea7e6d4dd75e9c7f4bde6c5f6380a12adb78f8e382fef5deee77f89701e50e08f422946e95a0e873222c47be17abf9bbc492f2666367115e22345; ttwid=1%7CJkFsjGYAqUh2dUbYn25LoKrMZwQvwGgnLyc6UNlcJs8%7C1673377554%7Cff1ca0e63cd68d9cdfd0344a0d8d34daead196a02f70a21124c59c50c18404d5; msToken=pQvxwqEJqN0NwCa48b3bbwSfqNjZ67iol29EDbP1ZZ-IAjVltK21xvFew0hTpQ8avrKdlgW3E2-QI5YJ9II2bOkzF3MeKImdtH8pcuv98RP02mTz53GY",
//     "Referer": "https://www.tiktok.com/",
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   "body": "type_requests=[{\"insigh_type\":\"week_top_videos_new\"},{\"insigh_type\":\"video_info\",\"aweme_id\":\"7019001914159336710\"},{\"insigh_type\":\"video_page_percent\",\"aweme_id\":\"7019001914159336710\"},{\"insigh_type\":\"video_region_percent\",\"aweme_id\":\"7019001914159336710\"},{\"insigh_type\":\"video_total_duration\",\"aweme_id\":\"7019001914159336710\"},{\"insigh_type\":\"video_total_duration_before\",\"aweme_id\":\"7019001914159336710\"},{\"insigh_type\":\"video_per_duration\",\"aweme_id\":\"7019001914159336710\"},{\"insigh_type\":\"video_per_duration_before\",\"aweme_id\":\"7019001914159336710\"},{\"insigh_type\":\"user_info\"},{\"insigh_type\":\"video_uv\",\"aweme_id\":\"7019001914159336710\"},{\"insigh_type\":\"video_uv_before\",\"aweme_id\":\"7019001914159336710\"},{\"insigh_type\":\"finish_rate\",\"aweme_id\":\"7019001914159336710\"},{\"insigh_type\":\"finish_rate_before\",\"aweme_id\":\"7019001914159336710\"},{\"insigh_type\":\"video_output_time\"},{\"insigh_type\":\"vv_history\",\"days\":8}]",
//   "method": "POST"
// });
async function getVideoIDsAsync (videoIDs, videoDurations = {}) {
    for (let i = 0; i < videoIDs.length; i++) {
        await fetch("https://api.us.tiktok.com/aweme/v1/data/insighs/?tz_offset=-14400&aid=1233&carrier_region=US", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/x-www-form-urlencoded",
                "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "cookie": process.env.COOKIE,
                "Referer": "https://www.tiktok.com/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": "type_requests=[{\"insigh_type\":\"video_total_duration\",\"aweme_id\":\"" + videoIDs[i] + "\"},{\"insigh_type\":\"video_uv\",\"aweme_id\":\"" + videoIDs[i] + "\"}]",
            "method": "POST"
            })
            .then((result) => result.json())
            .then((result) => {
                const {video_total_duration, video_uv } = result
                console.log("total duration: ", video_total_duration, "total views: ",  video_uv)
                createEntry(result, videoIDs[i])
            })
            .then(await sleep(300))
    }
    return videoDurations
}

getVideoIDsAsync(videoIDs, videoDurations)
    .then(createFile)

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

// async function getVideoDurations(videoArray, counter, error = false) {
//     // console.log("new run with counter at " + counter + " and undef count of " + undefCount)
//     if (error == true) return console.log("ran into error at: " + counter)
//     //if counter > videoArray.length, the script is over, save the JSON
//     if (counter >= videoArray.length) {
//         videoDurations.durationLog[numericalToday] = todaysDurationValue
//         //order the object        
//         const ordered = Object.keys(videoDurations).sort().reduce(
//             (obj, key) => { 
//               obj[key] = videoDurations[key]; 
//               return obj;
//             }, 
//             {}
//         );
//         //stringify it for saving as a JSON
//         const durationsToFile = JSON.stringify(ordered)
//         //save it
//         fs.writeFile('./data/' + numericalToday + '.json', durationsToFile, (err) => {
//             if (err) {
//                 throw err;
//             }
//             console.log("JSON data is saved.");
//         }) 
//         return console.log("finished")
//     }
//     //if there is no error and its not done, wait 5 seconds 
//     const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));
//     await waitFor(333);
//     //definition of the individual video data scraper
//     async function indivVideo () {
//         let aweme_id = videoIDs[counter]
//         console.log(aweme_id, "<- ID")
//         const response  = await fetch("https://api.us.tiktok.com/aweme/v1/data/insighs/?tz_offset=-14400&aid=1233&carrier_region=US", {
//         "headers": {
//             "accept": "*/*",
//             "accept-language": "en-US,en;q=0.9",
//             "content-type": "application/x-www-form-urlencoded",
//             "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
//             "sec-ch-ua-mobile": "?0",
//             "sec-ch-ua-platform": "\"macOS\"",
//             "sec-fetch-dest": "empty",
//             "sec-fetch-mode": "cors",
//             "sec-fetch-site": "same-site",
//             "cookie": process.env.COOKIE,
//             "Referer": "https://www.tiktok.com/",
//             "Referrer-Policy": "strict-origin-when-cross-origin"
//         },
//         "body": "type_requests=[{\"insigh_type\":\"video_total_duration\",\"aweme_id\":\"" + aweme_id + "\"},{\"insigh_type\":\"video_uv\",\"aweme_id\":\"" + aweme_id + "\"}]",
//         "method": "POST"
//         });
//         const result = await response.json()

//         //define todays duration and prior duration, defualt to 0 for falsy info
//         let priorDuration = videoDurations?.[aweme_id]?.[numericalYesterday]?.durationAtDate || 0
//         let todayDuration = result?.['video_total_duration']?.['value'] || 0
//         let priorViews = videoDurations?.[aweme_id]?.[numericalYesterday]?.viewsAtDate || 0
//         let todayViews = result?.['video_uv']?.['value'] || 0

//         //set pushable values (makes sure that bad/empty data does not sub in for old better data)
//         let pushableDuration = todayDuration > priorDuration ? todayDuration : priorDuration
//         let pushableViews = todayViews > priorViews ? todayDuration : priorDuration
        
//         //increment todays duration
//         todaysDurationValue += pushableDuration
        
//         //new info constructor
//         let TempDataObj = new function(pushableD) {
//             this.durationAtDate = pushableDuration
//             this.viewsAtDate = pushableViews
//         }

//         console.log(aweme_id, TempDataObj)
//         //assign the info to the video ID at its date
//         if (videoDurations[aweme_id] === undefined) videoDurations[aweme_id] = {}
//         videoDurations[aweme_id][numericalToday] = TempDataObj


//         if (response.status != 200) {
//             error = true
//             console.log(response.status)
//             console.log(response.content)
//         }

//     }
//     //run the individual video data scaper
//     indivVideo()
//     //increase the counter
//     let newCounter = parseInt(counter)
//     newCounter++
//     //log the counter
//     // console.log(newCounter)
//     //throw an error if there was an error
//     let newError = error
//     //recurseively run getVideoDurations
//     getVideoDurations(videoIDs, newCounter, newError)
// }

// getVideoDurations(videoIDs, 0, false)

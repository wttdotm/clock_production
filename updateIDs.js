var oldIDs = require('./data/videoIDs/combinedIDs.json')
const puppeteer = require('puppeteer');
const fs = require('fs')
//set your TikTok page as the URL
const url = "https://www.tiktok.com/@wttdotm";

(async () => {
    //initialize puppeteer, go to 
  const browser = await puppeteer.launch({
          headless: 'new',
	  args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  //go to the URL
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
  const html = await page.content();

  //collect any string of 19 chars after wttdotm/video (all video IDs have this format)
  const regexp = /wttdotm\/video\/(...................)/g
  const arrayLinks = [...html.matchAll(regexp)];
  let newIDs = []

  //define a function for parsing the results into an array
  function justIDs (arr) {
    for (let i = 0; i<arr.length; i++) {
      newIDs.push(arr[i][1].slice(-19))
    }
  }

// make the array of video IDs
  justIDs(arrayLinks)

//log them to check
  console.log(newIDs)

//compare against old video IDs and concat the non-overlap
  let joinedIDs = newIDs.concat(oldIDs.filter((item) => newIDs.indexOf(item) < 0 ))

//stringify them for saving
  const arrayFile = JSON.stringify(joinedIDs)

// write them
  fs.writeFile('./data/videoIDs/combinedIDs.json', arrayFile, (err ) => {
    if (err) {
      throw err;
    }
    console.log("JSON data saved")
  })
  console.log(justIDs(arrayLinks))


 await browser.close();

})();

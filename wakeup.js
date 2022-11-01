// Prevent Heroku from sleeping
var https = require("https");
const wakeup = () => setInterval(function () {
    https.get("https://opensea-metadata-scraper.herokuapp.com/");
    console.log("Wake Up Heroku!")
}, 30000); // every 30 sec (30000)

module.exports = wakeup;
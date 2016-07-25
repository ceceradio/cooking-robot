var config = require('./config.js');
var fsp = require('fs-promise');
var requestp = require('request-promise');
var Twitter = require('twitter');
var twitterClient = new Twitter(config.twitter);

var adjectives = [];
var foodItems = [];
var foodDishes = []

function processDictionaryIntoAdjectives(data) {
    var obj = JSON.parse(data);
    adjectives = obj.adjs;
}

function cleanFoodItem(foodItem) {
    if (foodItem.indexOf("(") > -1) {
        var aside = foodItem.slice(foodItem.indexOf("("), foodItem.indexOf(")")+1);    
    }
    foodItem = foodItem.replace(aside, "");
    foodItem = foodItem.toLowerCase();
    foodItem = foodItem.split(/[\s]*,[\s]*/).reverse().join(" ");
    if (aside) {
        foodItem += " " + aside;
    }
    return foodItem;
}
function processFoodItemsIntoList(data) {
    var items = JSON.parse(data);
    for(var key in items) {
        var foodItem = items[key];
        foodItem = cleanFoodItem(foodItem);
        foodItems.push(foodItem);
    }
}
function loadDictionary() {
    return fsp.readFile("adjs.json", {encoding:"utf8"})
}
function loadFoodDishes() {
    return requestp({
        uri: "http://api.cs50.net/food/3/recipes",
        qs: config.cs50,
        json: true
    })
    .then(function(data) {
        foodDishes = data;
    })
}
function loadFoodItems() {
    return fsp.readFile("food-items.json", {encoding:"utf8"})
}
function getRandomFoodItem() {
    return foodItems[Math.floor(Math.random() * foodItems.length)];
}
function getRandomFoodDish() {
    return foodDishes[Math.floor(Math.random() * foodDishes.length)].name.toLowerCase();
}
function getRandomAdjective() {
    return adjectives[Math.floor(Math.random() * adjectives.length)];
}
function tweet(text) {
    var tweetData = {status: text};
    twitterClient.post('statuses/update', tweetData, function(error, body, response) {
        if(error) {console.log("tweet Error:"); console.log(error); return;}
        console.log(tweetData.status);
    });
}
function makeTweet() {
    if (Math.random() >= 0.5) {
        var foodString = getRandomAdjective() + " " + getRandomFoodItem();
        tweet("I picked up some "+foodString+" from the store.");
    }
    else {
        var foodString = getRandomAdjective() + " " +getRandomAdjective() + " " + getRandomFoodDish();
        tweet("I cooked some "+foodString+".");
    }
}
function startTweeting() {
    makeTweet();
    setInterval(makeTweet, 60 * 1000);
}

loadDictionary()
.then(loadFoodDishes)
.then(loadDictionary)
.then(processDictionaryIntoAdjectives)
.then(loadFoodItems)
.then(processFoodItemsIntoList)
.then(startTweeting)
.catch(function(error) {
    console.log("Promise error:");
    console.log(error);
})

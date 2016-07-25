var config = require('./config.js');
var fsp = require('fs-promise');
var requestp = require('request-promise');
var Twitter = require('twitter');
var twitterClient = new Twitter(config.twitter);

var adjectives = [];
var ingredients = [];
var foodDishes = []

function loadDictionary() {
    return fsp.readFile("adjs.json", {encoding:"utf8"})
}
function processDictionaryIntoAdjectives(data) {
    var obj = JSON.parse(data);
    adjectives = obj;
}
function loadFoodDishes() {
    return requestp({
        uri: "http://api.cs50.net/food/3/recipes",
        qs: config.cs50,
        json: true
    })
    .then(function(data) {
        console.log("Loaded food dishes");
        foodDishes = data;
    })
    setInterval(loadFoodDishes, 1000 * 60 * 60 * 24); // updated food dishes once a day
}
function loadIngredients() {
    return fsp.readFile("ingredients.json", {encoding:"utf8"})
}
function processIngredientsIntoList(data) {
    var items = JSON.parse(data);
    ingredients = items;
}
function getRandomIngredient() {
    return ingredients[Math.floor(Math.random() * ingredients.length)];
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
        var foodString = getRandomAdjective() + " " + getRandomIngredient();
        tweet("I picked up some "+foodString+" from the store.");
    }
    else {
        var foodString = getRandomAdjective() + " " +getRandomAdjective() + " " + getRandomFoodDish();
        tweet("I cooked some "+foodString+".");
    }
}
function startTweeting() {
    makeTweet();
    setInterval(makeTweet, 15 * 60 * 1000);
}

loadDictionary()
.then(loadFoodDishes)
.then(loadDictionary)
.then(processDictionaryIntoAdjectives)
.then(loadIngredients)
.then(processIngredientsIntoList)
.then(startTweeting)
.catch(function(error) {
    console.log("Promise error:");
    console.log(error);
})
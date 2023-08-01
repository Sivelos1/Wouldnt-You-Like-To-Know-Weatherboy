dayjs.extend(window.dayjs_plugin_utc);

var cities = {
    length:0
}

const apiKey = "8fedcd2d5567c42876d357a3887a8492"

var now = dayjs();

console.log(now.format('M/D/YYYY'));

var cityName = $('#city-name');
var date = $('#date');
var icon = $('#icon');

var tempVal = $('#temperature-value');
var windVal = $('#wind-value');
var humVal = $('#humidity-value');

var searchButton = $('#search-btn');
var cityButtonList = $('#city-buttons');

var errorMessage = $('#error');
var forecastDisplay = $('#forecast-display');

const historyLimit = 8;

function revealErrorMessage(code){
    errorMessage.css('display','block');
    errorMessage.text("Something went wrong! Please try again. Error: "+code);
}

function Get(url, onSuccess){
    fetch(url).then(function(response){
        switch(response.status){
            case(400):
            case(404):
            revealErrorMessage(response.status);
            break;
            default:
                return response.json();
        }
    })
    .then(function(data){
        onSuccess(data);
    })
}

const storageID = 'WEATHER_DATA';

function CheckStorage(data, identifier){
    var result = localStorage.getItem(storageID+identifier);
    if(result === null || result === undefined){
        result = data;
        localStorage.setItem(storageID+"_weather", JSON.stringify(data));
        console.log("Found no data at "+storageID+identifier+"; saving parameters.")
    }
    else{
        if(result !== data){
            console.log("Conflicting data; overwriting data saved to "+storageID+identifier);
            localStorage.setItem(storageID+identifier, JSON.stringify(data));
            result = data;
        }
        return result;
    }
}

function LoadCities(){
    console.log("Loading city info from "+storageID+"_cities...");
    var t = localStorage.getItem(storageID+"_cities");
    if(t!== null && t!== undefined){
        console.log("Successfully loaded city info! Parsing...");
        cities = JSON.parse(t);
    }
    else{
        console.log("Could not find data at "+storageID+"_cities");
        SaveCities();
    }
}

function SaveCities(){
    localStorage.setItem(storageID+"_cities", JSON.stringify(cities))
    console.log("Saving city information to "+storageID+"_cities");
}

function AddCity(data){
    var obj = {
        name:data.name,
        lat:data.lat,
        long:data.long,
    }
    cities[cities.length] = obj;
    cities.length++;
    SaveCities();
}

var UpdateWeather = function(lat,long){
    errorMessage.css('display','none')
    Get("https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+long+"&appid="+apiKey+"&units=imperial", function(data){
        console.log(data);
        CheckStorage(data, "_weather");
        updateCurrentWeather(data);
        updateForecast(data);
        updateCities();
    });
}

var citySearch = $("#city-search");

var updateCurrentWeather = function(data){
    console.log(data);
    cityName.text(data.city.name);
    var today = data.list[0];
    date.text("("+now.format('M/D/YYYY')+")");
    tempVal.text(today.main.temp);
    windVal.text(today.wind.speed);
    humVal.text(today.main.humidity);
    var i = today.weather[0].icon;
    icon.attr('src',' https://openweathermap.org/img/wn/'+i+'.png')
}

var updateCities = function(){
    cityButtonList.empty();
    console.log(cities);
    for (let index = cities.length-1; index > Math.max(cities.length-historyLimit-1,-1); index--) {
        const element = cities[index*1];
        var btn = $('<button>');
        btn.addClass('w-100 city-btn ui-button ui-widget ui-corner-all m-1 rounded');
        btn.text(element.name);
        btn.on('click',AutoSearch);
        cityButtonList.append(btn);
    }
}

var CreateForecastCard = function(info){
    var holder = $('<div>');
    holder.addClass('m-1 bg-dark p-3 rounded text-light');

    var h3 = $('<h3>');
    var d = dayjs.unix(info.dt);
    h3.text(d.format('M/D/YYYY'));
    
    var img = $('<img>');
    img.attr('src', 'https://openweathermap.org/img/wn/'+info.weather[0].icon+'.png');

    var div1 = $('<div>');
    //--------------------------------------
    var tempHolder = $('<div>');
    tempHolder.addClass('d-flex');
    tempHolder.append($('<p>').text("Temp:"));
    var tempDiv1 = $('<div>');
    tempDiv1.addClass('d-flex');
    tempDiv1.css('margin-left','0.5rem');
    tempDiv1.append($('<p>').text(info.main.temp));
    tempDiv1.append($('<p>').text('°F'));
    tempHolder.append(tempDiv1);
    div1.append(tempHolder);
    //--------------------------------------
    var windHolder = $('<div>');
    windHolder.addClass('d-flex');
    windHolder.append($('<p>').text("Wind:"));
    var windDiv = $('<div>');
    windDiv.addClass('d-flex');
    windDiv.css('margin-left','0.5rem');
    windDiv.append($('<p>').text(info.wind.speed));
    windDiv.append($('<p>').text('MPH').css('margin-left','0.25rem'));
    windHolder.append(windDiv);
    div1.append(windHolder);
    //--------------------------------------
    var humHolder = $('<div>');
    humHolder.addClass('d-flex');
    humHolder.append($('<p>').text("Humidity:"));
    var humDiv = $('<div>');
    humDiv.addClass('d-flex');
    humDiv.css('margin-left','0.5rem');
    humDiv.append($('<p>').text(info.main.humidity));
    humDiv.append($('<p>').text('%'));
    humHolder.append(humDiv);
    div1.append(humHolder);
    //--------------------------------------
    holder.append(h3);
    holder.append(img);
    holder.append(div1);
    return holder;
}

var updateForecast = function(data){
    forecastDisplay.empty();
    var cardsDone = 0;
    for (let index = 6; index < data.list.length; index+=8) {
        const element = data.list[index].dt;
        var t = dayjs.unix(element);
        var card = CreateForecastCard(data.list[index]);
        forecastDisplay.append(card);
    }
}

var SearchForCity = function(event){
    event.preventDefault();
    var e = event.target;
    var search = $('#city-search');
    var name = search.val();
    Get("http://api.openweathermap.org/geo/1.0/direct?q="+name+",&limit=5&appid="+apiKey, function(data){
        if(data[0]!== null && data[0] !== undefined){
            AddCity({
                name:data[0].name,
                lat:data[0].lat,
                long:data[0].lon
            });
        UpdateWeather(data[0].lat, data[0].lon);
        }
        else{
            revealErrorMessage(404);
        }   
    
    });
}

var AutoSearch = function(event){
    event.preventDefault();
    var e = $(event.target);
    var name = e.text();
    if(cities[name] === null || cities[name] === undefined){
        console.log("Couldn't find city info in local storage. Searching...")
        Get("http://api.openweathermap.org/geo/1.0/direct?q="+name+",&limit=5&appid="+apiKey, function(data){
            AddCity({
                name:data[0].name,
                lat:data[0].lat,
                long:data[0].lon
            });
            UpdateWeather(data[0].lat, data[0].lon);
        });
    }
    else{
        console.log("City info already in local storage.");
        UpdateWeather(cities[name].lat, cities[name].long);
    }
}

searchButton.on('click', SearchForCity);
var children = cityButtonList.children();
for (let index = 0; index < children.length; index++) {
    const element = $(children[index]);
    element.on('click',AutoSearch);
    
}

LoadCities();

UpdateWeather(40.638378,-74.450897);
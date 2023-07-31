dayjs.extend(window.dayjs_plugin_utc);

var cities = {
    [0]:{
        name:"New York City",
        location:{
            lat:0,
            long:0
        }
    },
    [1]:{
        name:"Atlanta",
        location:{
            lat:0,
            long:0
        }
    },
    [2]:{
        name:"Seattle",
        location:{
            lat:0,
            long:0
        }
    },
    [3]:{
        name:"San Francisco",
        location:{
            lat:0,
            long:0
        }
    },
    [4]:{
        name:"Orlando",
        location:{
            lat:0,
            long:0
        }
    },
    [5]:{
        name:"Chicago",
        location:{
            lat:0,
            long:0
        }
    },
    [6]:{
        name:"Denver",
        location:{
            lat:0,
            long:0
        }
    },
    [7]:{
        name:"Austin",
        location:{
            lat:0,
            long:0
        }
    }
}

var now = dayjs();

console.log(now.format('M/D/YYYY'));

var cityName = $('#city-name');
var date = $('#date');
var icon = $('#icon');

var tempVal = $('#temperature-value');
var windVal = $('#wind-value');
var humVal = $('#humidity-value');

var forecastDisplay = $('#forecast-display');

function Get(url, onSuccess){
    fetch(url).then(function(response){
        return response.json();
    })
    .then(function(data){
        onSuccess(data);
    })
}

const storageID = 'WEATHER_DATA';

function CheckStorage(data){
    var result = localStorage.getItem(storageID);
    if(result === null || result === undefined){
        result = data;
        localStorage.setItem(storageID, JSON.stringify(data));
        console.log("Found no data at "+storageID+"; saving parameters.")
    }
    else{
        if(result !== data){
            console.log("Conflicting data; overwriting data saved to "+storageID);
            localStorage.setItem(storageID, JSON.stringify(data));
            result = data;
        }
        return result;
    }
}



var Update = function(lat,long){
    Get("https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+long+"&appid=8fedcd2d5567c42876d357a3887a8492&units=imperial", function(data){
        CheckStorage(data);
        updateCurrentWeather(data);
        updateForecast(data);
    });
}

var citySearch = $("#city-search");

var updateCurrentWeather = function(data){
    cityName.text(data.city.name);
    var today = data.list[0];
    date.text("("+now.format('M/D/YYYY')+")");
    tempVal.text(today.main.temp);
    windVal.text(today.wind.speed);
    humVal.text(today.main.humidity);
    var i = today.weather[0].icon;
    icon.attr('src',' https://openweathermap.org/img/wn/'+i+'.png')
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

Update(40.638378,-74.450897);
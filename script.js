
//Declare a variable to store the searched city
var city = "";
// variable declaration
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");
var cityS = [];
// searches the city to see if it exists in the entries from the storage
function find(city) {
    for (var i = 0; i < cityS.length; i++) {
        if (city === cityS[i]) {
            return -1;
        }
    }
    return 1;
}
//Set up the API key
var APIKey = "f5b1f646d2800bb178c05c721f1a3bfd";
// Display the cuf5b1f646d2800bb178c05c721f1a3bfdrent and future weather to the user after grabing the city form the input text box.
function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}
// Here we create the AJAX call
function currentWeather(city) {
    // Here we build the URL so we can get a data from server side.
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {

        // parse the response to display the current weather including the City name. the Date and the weather icon. 
        console.log(response);
        //Dta object from server side Api for icon property.
        var weathericon = response.weather[0].icon;
        var iconurl = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";
        // The date format method is taken from the  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        var date = new Date(response.dt * 1000).toLocaleDateString();
        //parse the response for name of city and concanatig the date and icon.
        $(currentCity).html(response.name + "(" + date + ")" + "<img src=" + iconurl + ">");
        // parse the response to display the current temperature.
        // Convert the temp to fahrenheit

        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2) + "&#8457");
        // Display the Humidity
        $(currentHumidty).html(response.main.humidity + "%");
        //Display Wind speed and convert to MPH
        var ws = response.wind.speed;
        var windsmph = (ws * 2.237).toFixed(1);
        $(currentWSpeed).html(windsmph + "MPH");
        // Display UVIndex.
        //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
        UVIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);
        if (response.cod == 200) {
            cityS = JSON.parse(localStorage.getItem("cityname"));
            console.log(cityS);
            if (cityS == null) {
                cityS = [];
                cityS.push(city);
                localStorage.setItem("cityname", JSON.stringify(cityS));
                addToList(city);
            }
            else {
                if (find(city) > 0) {
                    cityS.push(city);
                    localStorage.setItem("cityname", JSON.stringify(cityS));
                    addToList(city);
                }
            }
        }

    });
}
// This function returns the UVIindex response.
function UVIndex(ln, lt) {
    //lets build the url for uvindex.
    var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
        url: uvqURL,
        method: "GET"
    }).then(function (response) {
        $(currentUvindex).html(response.value);
    });
}

// Here we display the 5 days forecast for the current city.
function forecast(cityid) {
    var dayover = false;
    var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;
    $.ajax({
        url: queryforcastURL,
        method: "GET"
    }).then(function (response) {

        for (i = 0; i < 5; i++) {
            var date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            var iconcode = response.list[((i + 1) * 8) - 1].weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            var tempK = response.list[((i + 1) * 8) - 1].main.temp;
            var tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
            var humidity = response.list[((i + 1) * 8) - 1].main.humidity;

            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src=" + iconurl + ">");
            $("#fTemp" + i).html(tempF + "&#8457");
            $("#fHumidity" + i).html(humidity + "%");
        }

    });
}

//Daynamically add the passed city on the search history
function addToList(city) {
    var listEl = $("<li>" + city + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", city);
    $(".list-group").append(listEl);
}
// display the past search again when the list group item is clicked in search history
function recallCitys(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }

}

// render function
function renderlastCity() {
    $("ul").empty();
    var cityS = JSON.parse(localStorage.getItem("cityname"));
    if (cityS !== null) {
        cityS = JSON.parse(localStorage.getItem("cityname"));
        for (i = 0; i < cityS.length; i++) {
            addToList(cityS[i]);
        }
        city = cityS[i - 1];
        currentWeather(city);
    }

}
//Clear the search history from the page
function clearHolder(event) {
    event.preventDefault();
    cityS = [];
    localStorage.removeItem("cityname");
    document.location.reload();

}
//Click Handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", recallCitys);
$(window).on("load", renderlastCity);
$("#clear-history").on("click", clearHolder);






















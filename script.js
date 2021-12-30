$(document).ready(function () {
    $("#search-button").on("click", function () {
        var searched = $("#search-value").val();

        $("#search-value").val("");

        searchWeather(searched);
    });

    $(".history").on("click", "li", function () {
        searchWeather($(this).text());
    });

    function createRow(text) {
        var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
        $(".history").append(li);
    }



    function searchWeather(searched) {
        $.ajax({
            type: "GET",
            url: "https://api.openweathermap.org/data/2.5/weather?q=" + searched + "&appid=3f442ca53494215972540d3a8fd613df&units=imperial",
            dataType: "json",
            success: function (data) {
                if (history.indexOf(searched) === -1) {
                    history.push(searched);
                    window.localStorage.setItem("history", JSON.stringify(history));
                    createRow(searched);
                }
                $("#today").empty();

                var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
                var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
                var cardBody = $("<div>").addClass("card-body");
                var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
                var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
                var card = $("<div>").addClass("card");
                var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");


                title.append(img);
                cardBody.append(title, temp, humid, wind);
                card.append(cardBody);
                $("#today").append(card);
                getForecast(searched);
                getUVIndex(data.coord.lat, data.coord.lon);
            }
        });
    }

    function getForecast(searched) {
        $.ajax({
            type: "GET",
            url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searched + "&appid=3f442ca53494215972540d3a8fd613df&units=imperial",
            dataType: "json",
            success: function (data) {

                $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");


                for (var i = 0; i < data.list.length; i++) {
                    // only look at forecasts around 3:00pm
                    if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {

                        var col = $("<div>").addClass("col-md-2");
                        var card = $("<div>").addClass("card bg-primary text-white");
                        var body = $("<div>").addClass("card-body p-2");
                        var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
                        var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
                        var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
                        var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

                        col.append(card.append(body.append(title, img, p1, p2)));
                        $("#forecast .row").append(col);
                    }
                }
            }
        });
    }

    function getUVIndex(lat, lon) {
        $.ajax({
            type: "GET",
            url: "https://api.openweathermap.org/data/2.5/uvi?appid=3f442ca53494215972540d3a8fd613df&lat=" + lat + "&lon=" + lon,
            dataType: "json",
            success: function (data) {
                var uv = $("<p>").text("UV Index: ");
                var btn = $("<span>").addClass("btn btn-sm").text(data.value);

                if (data.value < 3) {
                    btn.addClass("btn-success");
                }
                else if (data.value < 7) {
                    btn.addClass("btn-warning");
                }
                else {
                    btn.addClass("btn-danger");
                }

                $("#today .card-body").append(uv.append(btn));
            }
        });
    }

    var history = JSON.parse(window.localStorage.getItem("history")) || [];

    if (history.length > 0) {
        searchWeather(history[history.length - 1]);
    }

    for (var i = 0; i < history.length; i++) {
        createRow(history[i]);
    }
});
var myAPIKey = 'f0a8549008177e01247d683aba23799b';

var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

var temperature;
var conditions;

function locationSuccess(pos) {
  // Construct URL
  var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' +
      pos.coords.latitude + '&lon=' + pos.coords.longitude + '&appid=' + myAPIKey;
  
  // Send request to OpenWeatherMap
  xhrRequest(url, 'GET', 
    function(responseText) {
      // Parse JSON
      var json = JSON.parse(responseText);
      
      // Temperature in kelvin to F
      temperature = Math.round(json.main.temp - 273.15) * (9.0 / 5.0) + 32;
      console.log('Temperature is ' + temperature);
      
      // Conditions 
      conditions = json.weather[0].main;
      console.log('Conditions are ' + conditions);
      
      // Assemble dictionary
      var dictionary = {
        'KEY_TEMPERATURE': temperature,
        'KEY_CONDITIONS': conditions  
      };

      // Send to Pebble
      Pebble.sendAppMessage(dictionary,
        function(e) {
          console.log('Weather info sent to Pebble successfully');                    
        },
        function(e) {
          console.log('Error sending weather info to Pebble');
        }
      );
    }
  );
}

function locationError(err) {
  console.log('Error requesting location');
}

function getWeather() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError, 
    {timeout: 15000, maximumAge: 60000}
  );
}

// Listen for when the watchface is opened
Pebble.addEventListener('ready', function(e) {
    console.log('PebbleKit JS ready!');
    
    // Get initial weather data
    getWeather();
});

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage', function(e) {
  console.log('Appmessage received');
  getWeather();
});

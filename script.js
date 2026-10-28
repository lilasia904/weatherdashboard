const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const weatherMessage = document.getElementById("weatherMessage");
const temperatureValue = document.getElementById("temperatureValue");
const humidityValue = document.getElementById("humidityValue");
const windValue = document.getElementById("windValue");
const weatherCondition = document.getElementById("weatherCondition");
const weatherIcon = document.getElementById("weatherIcon");
const forecastCards = document.getElementById("forecastCards");
const forecastMessage = document.getElementById("forecastMessage");



weatherForm.addEventListener("submit", function(event) {
  event.preventDefault();
  
const city = cityInput.value.trim();

temperatureValue.textContent = "--°F";
humidityValue.textContent = "--%";
windValue.textContent = "-- mph";
weatherCondition.textContent = "--";
weatherIcon.textContent = "";

weatherMessage.textContent = "Searching weather for " + city + "...";

clearWeatherResults();

findCity(city);

});


async function findCity(city) {
  
const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

try {

  const response = await fetch(url);


if (!response.ok) {
  throw new Error("City search failed: " + response.status);
}

  const data = await response.json();

if (!data.results || data.results.length === 0) {
  weatherMessage.textContent = "City not found. Try another city.";
  return;
}

const location = data.results[0];

getWeather(
  location.latitude,
  location.longitude,
  location.name
);
  

} catch (error) {
  console.error("City search failed:", error);

  weatherMessage.textContent =
    "Unable to search for that city. Please try again.";

  temperatureValue.textContent = "--°F";
  humidityValue.textContent = "--%";
  windValue.textContent = "-- mph";
}


}


async function getWeather(latitude, longitude, cityName) {

const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code,precipitation_probability&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=5&forecast_hours=12`;

try {

  const response = await fetch(url);


if (!response.ok) {
  weatherMessage.textContent =
    "Unable to load weather. Please try again.";

  return;
}


  const data = await response.json();

  document.getElementById("radarMap").style.visibility = "visible";

  getAirQuality(latitude, longitude);

if (weatherMap) {
  weatherMap.setView([latitude, longitude], 7);
}
 
  const hourlyCards = document.getElementById("hourlyCards");

  const hourlyMessage = document.getElementById("hourlyMessage");

  // Clear old hourly cards before adding new ones
  hourlyCards.textContent = "";

  data.hourly.time.forEach(function(time, index) {
    const card = document.createElement("article");

    card.classList.add("hourly-card");

    const hourText = document.createElement("p");

    const temperature = data.hourly.temperature_2m[index];


    const hourlyCode = data.hourly.weather_code[index];

    const hourlyIcon = document.createElement("span");

    hourlyIcon.classList.add("hourly-icon");
    hourlyIcon.setAttribute("aria-hidden", "true");


    
    if (hourlyCode === 0) {
      hourlyIcon.textContent = "☀️";

    } else if (hourlyCode === 1) {
      hourlyIcon.textContent = "🌤️";

    } else if (hourlyCode === 2) {
      hourlyIcon.textContent = "⛅";

    } else if (hourlyCode === 3) {
      hourlyIcon.textContent = "☁️";

    } else if ([45, 48].includes(hourlyCode)) {
      hourlyIcon.textContent = "🌫️";

    } else if ([51, 53, 55, 56, 57].includes(hourlyCode)) {
      hourlyIcon.textContent = "🌦️";

    } else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(hourlyCode)) {
      hourlyIcon.textContent = "🌧️";

    } else if ([71, 73, 75, 77, 85, 86].includes(hourlyCode)) {
      hourlyIcon.textContent = "❄️";

    } else if ([95, 96, 97, 99].includes(hourlyCode)) {
      hourlyIcon.textContent = "⛈️";

    } else {
      hourlyIcon.textContent = "❔";
    }


    const rainChance = data.hourly.precipitation_probability[index];

    const rainText = document.createElement("p");

    rainText.classList.add("hourly-rain");

    rainText.textContent = "💧 " + rainChance + "%";

    if (rainChance >= 70) {
      rainText.classList.add("high-rain");
    }

    const tempText = document.createElement("p");

    tempText.classList.add("hourly-temp");

    tempText.textContent = Math.round(temperature) + "°F";

const hour24 = Number(time.slice(11, 13));
const minutes = time.slice(14, 16);

const hour12 = hour24 % 12 || 12;
const period = hour24 >= 12 ? "PM" : "AM";

hourText.textContent = `${hour12}:${minutes} ${period}`;

    card.appendChild(hourText);
    card.appendChild(hourlyIcon);
    card.appendChild(tempText);
    card.appendChild(rainText);
    hourlyCards.appendChild(card);
    });
  
  hourlyMessage.textContent = "";

  forecastCards.textContent = "";

  data.daily.time.forEach(function(date, index) {
    const card = document.createElement("article");

    const high = data.daily.temperature_2m_max[index];

    const low = data.daily.temperature_2m_min[index];

    const dayCode = data.daily.weather_code[index];

    card.classList.add("forecast-card");
  
    const dateHeading = document.createElement("h3");

    const forecastIcon = document.createElement("span");

    forecastIcon.classList.add("forecast-icon");
    forecastIcon.setAttribute("aria-hidden", "true")
    
    if (dayCode === 3) {
      forecastIcon.textContent = "☁️";
      forecastIcon.classList.add("cloud-icon");
    } else if (dayCode === 0) {
      forecastIcon.textContent = "☀️";
    } else if ([71, 73, 75, 77, 85, 86].includes(dayCode)) {
      forecastIcon.textContent = "❄️";
    } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(dayCode)) {
      forecastIcon.textContent = "🌧️";
    } else if (dayCode === 1) {
      forecastIcon.textContent = "🌤️";
    } else if ([45, 48].includes(dayCode)) {
      forecastIcon.textContent = "🌫️";
    } else if ([95, 96, 97, 99].includes(dayCode)) {
      forecastIcon.textContent = "⛈️";
    } else if (dayCode === 2) {
      forecastIcon.textContent = "⛅";
    } else {
      forecastIcon.textContent = "❔";
}


      const highText = document.createElement("p");
      const lowText = document.createElement("p");
      highText.classList.add("forecast-high");

      highText.textContent = "High: " + Math.round(high) + "°F";

      lowText.classList.add("forecast-low");

      lowText.textContent = "Low: " + Math.round(low) + "°F";

    
    const formattedDate = new Date(date + "T12:00:00");

    dateHeading.textContent = formattedDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });


    
    card.appendChild(dateHeading);
    card.appendChild(forecastIcon);
    card.appendChild(highText);
    card.appendChild(lowText);

    forecastCards.appendChild(card);

  });

  forecastMessage.textContent = "";
  
const temperature = data.current.temperature_2m;

const humidity = data.current.relative_humidity_2m;

const windSpeed = data.current.wind_speed_10m;

const weatherCode = data.current.weather_code;


let condition;

if (weatherCode === 0) {
  condition = "Clear Sky";
} else if (weatherCode === 1) {
  condition = "Mainly Clear";
} else if (weatherCode === 2) {
  condition = "Partly Cloudy";
} else if (weatherCode === 3) {
  condition = "Overcast";
} else if ([45, 48].includes(weatherCode)) {
  condition = "Foggy";
} else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
  condition = "Rain or Drizzle";
} else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
  condition = "Snowy";
} else if ([95, 96, 99].includes(weatherCode)) {
  condition = "Thunderstorm";
} else {
  condition = "Other Weather Conditions";
}

weatherCondition.textContent = condition;

if (condition === "Overcast") {
  weatherIcon.textContent = "☁️";
} else if (condition === "Snowy") {
  weatherIcon.textContent = "❄️";
} else if (condition === "Mainly Clear") {
  weatherIcon.textContent ="☀️";
} else if (condition === "Clear Sky") {
  weatherIcon.textContent = "☀️";
} else if (condition === "Partly Cloudy") {
  weatherIcon.textContent = "⛅";
} else if (condition === "Foggy") {
  weatherIcon.textContent = "🌫️"
} else if (condition === "Rain or Drizzle") {
  weatherIcon,textContent = "🌧️"
} else if (condition === "Thunderstorm") {
  weatherIcon.textContent = "⛈️"
}

temperatureValue.textContent = Math.round(temperature) + "°F";
humidityValue.textContent = humidity + "%";
windValue.textContent = windSpeed + " mph";

weatherMessage.textContent = "Current weather in " + cityName;

} catch (error) {
  console.error("Weather request failed:", error);

  weatherMessage.textContent =
    "Unable to connect to the weather service. Please try again.";

  temperatureValue.textContent = "--°F";
  humidityValue.textContent = "--%";
  windValue.textContent = "-- mph";
}


}
 
let weatherMap;

document.addEventListener("DOMContentLoaded", function() {
  weatherMap = L.map("radarMap").setView([39.8, -98.6], 4);


L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(weatherMap);

loadRadar();

});


async function loadRadar() {
  const radarMessage = document.getElementById("radarMessage");

  radarMessage.textContent = "Loading radar...";

  try {
    const response = await fetch(
      "https://api.rainviewer.com/public/weather-maps.json"
    );

    if (!response.ok) {
      throw new Error("Radar request failed");
    }

    const data = await response.json();
    const frames = data.radar.past;

    if (!frames || frames.length === 0) {
      throw new Error("No radar images available");
    }

    const latestFrame = frames[frames.length - 1];

    const radarUrl =
      `${data.host}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

    L.tileLayer(radarUrl, {
      tileSize: 256,
      opacity: 0.75,
      maxNativeZoom: 7,
      maxZoom: 19,
      attribution: 'Radar &copy; <a href="https://www.rainviewer.com/">RainViewer</a>'
    }).addTo(weatherMap);

    radarMessage.textContent = "Latest available precipitation radar.";

  } catch (error) {
    console.error("Radar Error:", error);
    radarMessage.textContent = "Radar unavailable right now.";
  }
}


async function getAirQuality(latitude, longitude) {
  const aqiValue = document.getElementById("aqiValue");
  const aqiStatus = document.getElementById("aqiStatus");
  const aqiDescription = document.getElementById("aqiDescription");

  aqiValue.textContent = "--";
  aqiStatus.textContent = "Loading air quality...";
  aqiDescription.textContent = "";

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Air quality request failed");
    }

    const data = await response.json();

    const aqi = data.current?.us_aqi;

    if (aqi == null) {
      throw new Error("AQI data unavailable");
    }

    aqiValue.textContent = Math.round(aqi);
    
if (aqi <= 50) {
  aqiStatus.textContent = "Good";
  aqiDescription.textContent = "Air quality is satisfactory.";

} else if (aqi <= 100) {
  aqiStatus.textContent = "Moderate";
  aqiDescription.textContent = "Air quality is acceptable for most people.";

} else if (aqi <= 150) {
  aqiStatus.textContent = "Unhealthy for Sensitive Groups";
  aqiDescription.textContent = "Sensitive groups may experience health effects.";

} else if (aqi <= 200) {
  aqiStatus.textContent = "Unhealthy";
  aqiDescription.textContent = "Air pollution may affect everyone's health.";

} else if (aqi <= 300) {
  aqiStatus.textContent = "Very Unhealthy";
  aqiDescription.textContent = "Health risks are increased for everyone.";

} else {
  aqiStatus.textContent = "Hazardous";
  aqiDescription.textContent = "Health warning: everyone is at greater risk.";
}

const aqiMarker = document.getElementById("aqiMarker");

const markerPosition = Math.min(100, Math.max(0, (aqi / 500) * 100));

aqiMarker.style.left = markerPosition + "%";
aqiMarker.style.visibility = "visible";


    console.log("Air Quality Index:", aqi);

  } catch (error) {
    console.error("Air Quality Error:", error);
    aqiStatus.textContent = "Air quality unavailable.";
  }
}

function clearWeatherResults() {
  // Clear previous forecast cards
  document.getElementById("forecastCards").textContent = "";
  document.getElementById("hourlyCards").textContent = "";

  // Reset forecast messages
  document.getElementById("forecastMessage").textContent =
    "Search for a city to see the forecast.";

  document.getElementById("hourlyMessage").textContent =
    "Search for a city to see hourly weather.";

  // Reset air quality
  document.getElementById("aqiValue").textContent = "--";
  document.getElementById("aqiStatus").textContent =
    "Search for a city to view air quality.";

  document.getElementById("aqiDescription").textContent = "";
  document.getElementById("aqiMarker").style.visibility = "hidden";

  // Hide the previous city's radar
  document.getElementById("radarMap").style.visibility = "hidden";

  document.getElementById("radarMessage").textContent =
    "Search for a city to view precipitation.";
}


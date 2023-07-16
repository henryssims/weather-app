import { format } from 'date-fns';

const locationDisplay = document.querySelector('#location');
const dayDisplay = document.querySelector('#day');
const conditionDisplay = document.querySelector('#condition');
const tempDisplay = document.querySelector('#temp');
const minTempDisplay = document.querySelector('#min-temp')
const maxTempDisplay = document.querySelector('#max-temp');
const rainDisplay = document.querySelector('#rain');
const windDisplay = document.querySelector('#wind');
const forecastDisplay = document.querySelector('#forecast');
const measurementButton = document.querySelector('#measurement-button');
const errorMsg = document.querySelector('#error');
const searchForm = document.querySelector('#search-form');
searchForm.addEventListener('submit', handleSubmit);

let measurement = 'F';
let currLocation = 'philadelphia';
let lastLocation = '';

async function getWeather() {
    const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=2b9f838308394d0fb05204758231507&q=${currLocation}&days=3&aqi=no&alerts=no`);
    return await response.json();    
}

function processWeather() {
    getWeather().then(weather => {
        const weatherDataToday = {
            city: weather.location.name,
            state: weather.location.region,
            country: weather.location.country,
            day: weather.location.localtime,
            condition: weather.current.condition.text,
            windMPH: weather.current.wind_mph,
            windKPH: weather.current.wind_kph,
            rain: weather.forecast.forecastday[0].day.daily_chance_of_rain,
            tempC: weather.current.temp_c,
            tempF: weather.current.temp_f,
            maxTempC: weather.forecast.forecastday[0].day.maxtemp_c,
            minTempC: weather.forecast.forecastday[0].day.mintemp_c,
            maxTempF: weather.forecast.forecastday[0].day.maxtemp_f,
            minTempF: weather.forecast.forecastday[0].day.mintemp_f
        }
        displayToday(weatherDataToday);

        for (let i = 1; i < weather.forecast.forecastday.length; i++) {
            const currDay = weather.forecast.forecastday[i];
            const weatherDataFuture = {
                day: currDay.date,
                condition: currDay.day.condition.text,
                tempC: currDay.day.avgtemp_c,
                tempF: currDay.day.avgtemp_f,
                maxTempC: currDay.day.maxtemp_c,
                minTempC: currDay.day.mintemp_c,
                maxTempF: currDay.day.maxtemp_f,
                minTempF: currDay.day.mintemp_f,
                rain: currDay.day.daily_chance_of_rain
            }
            displayFuture(weatherDataFuture);
        }
    }).catch(error => {
        errorMsg.style.display = 'block';
        currLocation = lastLocation;
        setTimeout(() => {
            errorMsg.style.display = 'none'}, 3500);
    });
}

function displayToday(weather) {
    if (weather.country == 'United States of America') {
        locationDisplay.textContent = `${weather.city}, ${weather.state}`;
    } else {
        locationDisplay.textContent = `${weather.city}, ${weather.country}`;
    }
    conditionDisplay.textContent = weather.condition;
    dayDisplay.textContent = format(new Date(weather.day), 'eeee, MMMM d');
    if (measurement === "F") {
        tempDisplay.textContent = `${weather.tempF} °F`;
        minTempDisplay.textContent = `Low: ${weather.minTempF} °F`;
        maxTempDisplay.textContent = `High: ${weather.maxTempF} °F`;
        windDisplay.textContent = `Wind: ${weather.windMPH} mph`;
    } else {
        tempDisplay.textContent = `${weather.tempC} °C`;
        minTempDisplay.textContent = `Low: ${weather.minTempC} °C`;
        maxTempDisplay.textContent = `High: ${weather.maxTempC} °C`;
        windDisplay.textContent = `Wind: ${weather.windKPH} kph`;
    }
    rainDisplay.textContent = `Rain: ${weather.rain} %`;
}

function displayFuture(weather) {
    const module = document.createElement('div');
    module.classList.add('forecast-day');

    const day = document.createElement('h2');
    const condition = document.createElement('h2');
    const temp = document.createElement('h2');
    const minTemp = document.createElement('h2');
    const maxTemp = document.createElement('h2');
    const rain = document.createElement('h2');

    day.textContent = format(new Date(weather.day + 'T00:00'), 'eeee');
    condition.textContent = weather.condition;

    if (measurement === 'F') {
        temp.textContent = `${weather.tempF} °F`;    
        minTemp.textContent = `Low: ${weather.minTempF} °F`;
        maxTemp.textContent = `High: ${weather.maxTempF} °F`;
    } else {
        temp.textContent = `${weather.tempC} °C`;    
        minTemp.textContent = `Low: ${weather.minTempC} °C`;
        maxTemp.textContent = `High: ${weather.maxTempC} °C`;
    }
    
    rain.textContent = `Rain: ${weather.rain} %`;
    
    module.appendChild(day);
    module.appendChild(condition);
    module.appendChild(temp);
    module.appendChild(minTemp);
    module.appendChild(maxTemp);
    module.appendChild(rain);
    forecastDisplay.appendChild(module);
}

measurementButton.addEventListener('click', () => {
    forecastDisplay.innerHTML = '';
    if (measurement === 'F') {
        measurement = 'C';
        measurementButton.textContent = '°C/kph';
        processWeather();
    } else {
        measurement = 'F';
        measurementButton.textContent = '°F/mph';
        processWeather();
    }
});

function handleSubmit(event) {
    event.preventDefault();
    lastLocation = currLocation;
    currLocation = document.querySelector('#location-search').value;
    searchForm.reset();
    processWeather();
}

processWeather();
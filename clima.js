const apiKey = '1aabe93636c4abd5d774d61533f384c4'; // Reemplaza 'TU_API_KEY' con tu API key de OpenWeatherMap

document.addEventListener('DOMContentLoaded', () => {
    // Remove initial calls to getCurrentWeather and getWeatherForecast
    // getCurrentWeather();
    // getWeatherForecast();
});

document.getElementById('yesBtn').addEventListener('click', () => {
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('formBox').style.display = 'block';
});

document.getElementById('noBtn').addEventListener('click', () => {
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('mapBox').style.display = 'block';
    initializeMap();
});

document.getElementById('coordinatesForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    await getWeather(latitude, longitude);
    await getWeatherForecast(latitude, longitude);
});

function initializeMap() {
    const map = L.map('map').setView([23.6345, -102.5528], 5); // Coordenadas de México

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let marker;

    map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker([lat, lng]).addTo(map);
        await getWeather(lat, lng, marker);
        await getWeatherForecast(lat, lng);
    });
}

async function getWeather(lat, lng, marker = null) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=es`);
        const data = await response.json();
        displayWeather(data, lat, lng, marker);
    } catch (error) {
        console.error('Error obteniendo el clima:', error);
    }
}

function displayWeather(data, lat, lng, marker) {
    const weatherInfo = `
        <h3>Clima Actual</h3>
        <p><strong>Ciudad:</strong> ${data.name}</p>
        <p><strong>Latitud:</strong> ${lat.toFixed(4)}</p>
        <p><strong>Longitud:</strong> ${lng.toFixed(4)}</p>
        <p><strong>Temperatura:</strong> ${data.main.temp} °C</p>
        <p><strong>Humedad:</strong> ${data.main.humidity}%</p>
        <p><strong>Descripción:</strong> ${data.weather[0].description}</p>
    `;

    if (marker) {
        marker.bindPopup(weatherInfo).openPopup();
    }
}

async function getWeatherForecast(lat, lng) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=es`);
        const data = await response.json();
        displayWeatherForecast(data);
    } catch (error) {
        console.error('Error obteniendo el pronóstico del tiempo:', error);
    }
}

function displayWeatherForecast(data) {
    const forecastDiv = document.querySelector('#forecast-weather .forecast-grid');
    let forecastInfo = '';
    data.list.forEach((item, index) => {
        if (index % 8 === 0) { // Mostrar pronóstico cada 24 horas (8 intervalos de 3 horas)
            forecastInfo += `
                <div class="forecast-item">
                    <p><strong>Fecha:</strong> ${new Date(item.dt * 1000).toLocaleDateString()}</p>
                    <p><strong>Temperatura:</strong> ${item.main.temp} °C</p>
                    <p><strong>Humedad:</strong> ${item.main.humidity}%</p>
                    <p><strong>Descripción:</strong> ${item.weather[0].description}</p>
                </div>
            `;
        }
    });
    forecastDiv.innerHTML = forecastInfo;
    document.getElementById('forecast-weather').style.display = 'block';
}

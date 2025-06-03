import fs from 'fs';
import fetch from 'node-fetch';

async function fetchWeatherDataFromNASA(lat, lon) {
    try {
        const response = await fetch(`https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,T2M&community=RE&longitude=${lon}&latitude=${lat}&start=20231115&end=20240116&format=JSON`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.properties.parameter;
    } catch (error) {
        console.error('Error fetching weather data from NASA POWER:', error);
        return null;
    }
}

async function generateCSV(lat, lon) {
    const weatherData = await fetchWeatherDataFromNASA(lat, lon);

    if (!weatherData) {
        console.error('No data available to generate CSV.');
        return;
    }

    const { ALLSKY_SFC_SW_DWN, T2M } = weatherData;
    const dates = Object.keys(ALLSKY_SFC_SW_DWN);

    const rows = [
        ['Fecha', 'Promedio Radiación Solar (kWh/m²)', 'Promedio Temperatura (°C)']
    ];

    for (const date of dates) {
        rows.push([
            date,
            ALLSKY_SFC_SW_DWN[date],
            T2M[date]
        ]);
    }

    const csvContent = rows.map(row => row.join(',')).join('\n');

    fs.writeFileSync('promedio_radiacion_solar_nasa.csv', csvContent);
    console.log('Archivo CSV generado: promedio_radiacion_solar_nasa.csv');
}

// Coordenadas de la ubicación
const lat = 19.6831;
const lon = -101.2002;

generateCSV(lat, lon);
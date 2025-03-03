// Initialize the map centered on Mexico
const map = L.map('map').setView([23.6345, -102.5528], 5);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Variable to store the current popup
let currentPopup = null;

// Fetch solar radiation data from Open Meteo API
async function fetchSolarRadiation(lat, lon) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=shortwave_radiation`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.hourly ? data.hourly.shortwave_radiation : null;
    } catch (error) {
        console.error('Error fetching solar radiation data:', error);
        return null;
    }
}

// Add a click event to the map to fetch and display solar radiation data
map.on('click', async (e) => {
    const { lat, lng } = e.latlng;

    try {
        // Close previous popup if it exists
        if (currentPopup) {
            map.closePopup(currentPopup);
        }

        // Show loading message with visual indicator
        currentPopup = L.popup()
            .setLatLng(e.latlng)
            .setContent('<div><span class="loading"></span> Obteniendo datos...</div>')
            .openOn(map);

        // Fetch solar radiation data
        const solarRadiation = await fetchSolarRadiation(lat, lng);
        const radiation = solarRadiation ? solarRadiation[0] : 'No disponible';
        const timestamp = new Date().toLocaleString();

        // Display result in a popup
        currentPopup = L.popup()
            .setLatLng(e.latlng)
            .setContent(`
                <div class="info">
                    <h3 style="margin-top: 0; color: #3388ff;">Datos de Radiación Solar</h3>
                    <b>Ubicación:</b> ${lat.toFixed(4)}, ${lng.toFixed(4)}<br>
                    <b>Radiación Solar:</b> ${radiation} W/m²<br>
                    <b>Hora:</b> ${timestamp}<br>
                    <small>Datos obtenidos de Open-Meteo</small>
                </div>
            `)
            .openOn(map);

    } catch (error) {
        currentPopup = L.popup()
            .setLatLng(e.latlng)
            .setContent(`
                <div class="info">
                    <h3 style="margin-top: 0; color: #d9534f;">⚠ Error</h3>
                    ${error.message}<br>
                    <small>Error obteniendo los datos de radiación solar</small>
                </div>
            `)
            .openOn(map);
        console.error('Error obteniendo los datos:', error);
    }
});

// Add an information control
const info = L.control();
info.onAdd = function() {
    this._div = L.DomUtil.create('div', 'info');
    this._div.innerHTML = '<h4>Mapa de Radiación Solar</h4>' +
                          'Haz clic en cualquier punto para ver datos de radiación solar.';
    return this._div;
};
info.addTo(map);

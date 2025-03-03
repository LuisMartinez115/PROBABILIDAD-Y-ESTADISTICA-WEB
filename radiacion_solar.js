// Inicializar el mapa en España
const map = L.map('map').setView([40.4168, -3.7038], 5);

// Añadir capa de mapa con atribución correcta
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Variable para guardar el popup actual
let currentPopup = null;

// Función para generar datos simulados basados en la ubicación
function generateMockData(lat, lng) {
    // Simulamos mayor radiación en latitudes más cercanas al ecuador
    const baseRadiation = 1000 - Math.abs(lat) * 15;
    
    // Añadimos variación basada en la longitud
    const longitudeVariation = Math.sin(lng/10) * 100;
    
    // Añadimos algo de aleatoriedad
    const randomVariation = Math.random() * 200 - 100;
    
    // Calculamos el valor final (con un mínimo de 50)
    let radiation = Math.max(50, baseRadiation + longitudeVariation + randomVariation);
    
    // Redondeamos a 2 decimales
    radiation = Math.round(radiation * 100) / 100;
    
    return {
        ghi: radiation,
        period_end: new Date().toISOString()
    };
}

// Evento al hacer clic en el mapa
map.on('click', async (e) => {
    const { lat, lng } = e.latlng;
    
    try {
        // Cerrar popup anterior si existe
        if (currentPopup) {
            map.closePopup(currentPopup);
        }
        
        // Mostrar mensaje de carga con indicador visual
        currentPopup = L.popup()
            .setLatLng(e.latlng)
            .setContent('<div><span class="loading"></span> Generando datos...</div>')
            .openOn(map);

        // Simulamos un pequeño retraso como en una API real
        await new Promise(resolve => setTimeout(resolve, 500));

        // Generar datos simulados
        const mockData = generateMockData(lat, lng);
        const radiation = mockData.ghi.toFixed(2); // GHI en W/m²
        const timestamp = new Date(mockData.period_end).toLocaleString();

        // Mostrar resultado en un popup
        currentPopup = L.popup()
            .setLatLng(e.latlng)
            .setContent(`
                <div class="info">
                    <h3 style="margin-top: 0; color: #3388ff;">Datos de Radiación Solar (Simulados)</h3>
                    <b>Ubicación:</b> ${lat.toFixed(4)}, ${lng.toFixed(4)}<br>
                    <b>Radiación Solar (GHI):</b> ${radiation} W/m²<br>
                    <b>Hora:</b> ${timestamp}<br>
                    <small>Nota: Estos son datos simulados para demostración</small>
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
                    <small>Error en la generación de datos simulados</small>
                </div>
            `)
            .openOn(map);
        console.error('Error generando los datos:', error);
    }
});

// Añadir un control de información
const info = L.control();
info.onAdd = function() {
    this._div = L.DomUtil.create('div', 'info');
    this._div.innerHTML = '<h4>Mapa de Radiación Solar (Demo)</h4>' +
                          'Haz clic en cualquier punto para ver datos simulados.';
    return this._div;
};
info.addTo(map);

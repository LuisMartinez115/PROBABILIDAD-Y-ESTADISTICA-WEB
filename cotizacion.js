document.getElementById('unknown-coordinates-btn').addEventListener('click', () => {
    const optionsDiv = document.getElementById('options');
    optionsDiv.style.display = 'block';
});

document.getElementById('map-option').addEventListener('click', () => {
    const form = document.getElementById('coordinates-form');
    form.style.display = 'none';

    const mainContent = document.querySelector('main');
    const mapContainer = document.createElement('div');
    mapContainer.id = 'map';
    mapContainer.style.height = '500px';
    mainContent.appendChild(mapContainer);

    const map = L.map('map').setView([23.634501, -102.552784], 5); // Centered on Mexico
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let marker;

    map.on('click', (e) => {
        const { lat, lng } = e.latlng;

        if (marker) {
            map.removeLayer(marker);
        }

        marker = L.marker([lat, lng]).addTo(map);

        const popupContent = `
            <div>
                <p><strong>Latitud:</strong> ${lat.toFixed(4)}</p>
                <p><strong>Longitud:</strong> ${lng.toFixed(4)}</p>
                <button id="confirm-coordinates-btn">Confirmar Coordenadas</button>
            </div>
        `;

        marker.bindPopup(popupContent).openPopup();

        setTimeout(() => {
            document.getElementById('confirm-coordinates-btn').addEventListener('click', () => {
                alert(`Coordenadas confirmadas:\nLatitud: ${lat.toFixed(4)}\nLongitud: ${lng.toFixed(4)}`);
            });
        }, 0);
    });
});

document.getElementById('address-option').addEventListener('click', () => {
    const optionsDiv = document.getElementById('options');
    optionsDiv.style.display = 'none';

    const form = document.getElementById('coordinates-form');
    const addressInputContainer = document.createElement('div');
    addressInputContainer.id = 'address-input-container';
    addressInputContainer.innerHTML = `
        <label for="address">Introduce tu dirección:</label>
        <input type="text" id="address" placeholder="Ejemplo: Ciudad de México, México" required>
        <button type="button" id="accept-address-btn">Aceptar</button>
    `;
    form.parentNode.appendChild(addressInputContainer);

    document.getElementById('accept-address-btn').addEventListener('click', async () => {
        const address = document.getElementById('address').value;
        if (!address) {
            alert('Por favor, introduce una dirección válida.');
            return;
        }

        // Use Google Maps Geocoding API to get coordinates from the address
        try {
            const apiKey = 'AIzaSyCKoex6jbtg5fan1rvtoVhZtj2VJZ34DOk'; // Replace with your Google Maps API key
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
            const data = await response.json();

            if (data.status !== 'OK') {
                alert('No se encontraron resultados para la dirección ingresada.');
                return;
            }

            const { lat, lng } = data.results[0].geometry.location;

            // Hide the address input and show the map
            addressInputContainer.style.display = 'none';

            const mainContent = document.querySelector('main');
            const mapContainer = document.createElement('div');
            mapContainer.id = 'map';
            mapContainer.style.height = '500px';
            mainContent.appendChild(mapContainer);

            const map = L.map('map').setView([lat, lng], 13); // Center map on the address
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            L.marker([lat, lng]).addTo(map).bindPopup(`Dirección: ${address}`).openPopup();
        } catch (error) {
            console.error('Error al obtener las coordenadas de la dirección:', error);
            alert('Ocurrió un error al procesar la dirección. Inténtalo nuevamente.');
        }
    });
});

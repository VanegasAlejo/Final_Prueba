// Inicializar el mapa
const map = L.map('map');

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Cargar GeoJSON
fetch('Vial_Macarena.geojson')
  .then(response => {
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return response.json();
  })
  .then(data => {
    // Crear la capa GeoJSON
    const geojsonLayer = L.geoJSON(data, {
      style: {
        color: "#8B4513",
        weight: 4,
        opacity: 0.8
      },
      onEachFeature: function (feature, layer) {
        const nombre = feature.properties?.MVIETIQUET || 'Sin nombre';

        // Calcular dirección aproximada
        const coords = feature.geometry.coordinates;
        let direccion = 'Indeterminada';
        if (coords.length >= 2) {
          const [inicioLng, inicioLat] = coords[0];
          const [finLng, finLat] = coords[coords.length - 1];
          const deltaLng = Math.abs(finLng - inicioLng);
          const deltaLat = Math.abs(finLat - inicioLat);
          direccion = deltaLng > deltaLat ? 'Horizontal (E-W)' : 'Vertical (N-S)';
        }

        // Función para copiar coordenadas
        function copiarCoordenadas(lat, lng) {
          const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          navigator.clipboard.writeText(coords)
            .then(() => {
              alert(`✅ Coordenadas copiadas:\n${coords}`);
            })
            .catch(err => {
              console.error('Error al copiar:', err);
              alert('❌ No se pudo copiar. Usa un navegador moderno o localhost.');
            });
        }

        // Popup con botón dinámico
        layer.on('click', function (e) {
          const { lat, lng } = e.latlng;
          const latitud = lat.toFixed(6);
          const longitud = lng.toFixed(6);

          const popupContent = `
            <strong>Vía:</strong> ${nombre} <br>
            <strong>Coordenadas:</strong> ${latitud}, ${longitud} <br>
            <strong>Dirección:</strong> ${direccion} <br><br>
            <button id="copy-btn" style="font-size:12px; padding:5px 8px; background:#5d4037; color:white; border:none; border-radius:4px; cursor:pointer;">
              📋 Copiar coordenadas
            </button>
          `;

          const popup = layer.bindPopup(popupContent).openPopup();

          // Añadir evento al botón usando DOM
          const btn = popup.getElement().querySelector('#copy-btn');
          if (btn) {
            btn.addEventListener('click', () => copiarCoordenadas(lat, lng));
          }
        });

        // Clic derecho: copiar coordenadas
        layer.on('contextmenu', function (e) {
          const { lat, lng } = e.latlng;
          copiarCoordenadas(lat, lng);
          L.DomEvent.stopPropagation(e);
        });
      }
    }).addTo(map);

    // Centrar el mapa
    map.fitBounds(geojsonLayer.getBounds(), {
      padding: [50, 50],
      maxZoom: 18
    });

  })
  .catch(error => {
    console.error('Error al cargar el GeoJSON:', error);
    alert('Error al cargar los datos: ' + error.message);

    // Fallback: mostrar posición de La Macarena
    map.setView([4.6097, -74.0817], 15);
    L.marker([4.6097, -74.0817])
      .addTo(map)
      .bindPopup("⚠️ No se cargaron las vías, pero aquí está La Macarena.")
      .openPopup();
  });
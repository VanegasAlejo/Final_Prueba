document.addEventListener('DOMContentLoaded', function() {
  // Inicializar el mapa centrado en Bogotá (esto se ajustará luego)
  const map = L.map('map').setView([4.60971, -74.08175], 14);

  // Agregar capa base de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let barrioProps = null;

  // Cargar y mostrar el contorno del barrio La Macarena y guardar sus propiedades
  fetch('BARRIO LA MACARENA.geojson')
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data, {
        style: {
          color: 'black', // Contorno negro
          weight: 3,
          fillOpacity: 0 // Sin fondo, solo contorno
        }
      }).addTo(map);

      // Suponiendo que solo hay un barrio, tomamos las propiedades del primer feature
      if (data.features && data.features.length > 0) {
        barrioProps = data.features[0].properties;
      }
    })
    .catch(error => console.error('Error al cargar el GeoJSON del barrio:', error));

  // Cargar y mostrar los parques desde el archivo GeoJSON
  fetch('Parque_Macarena.geojson')
    .then(response => response.json())
    .then(data => {
      const parquesLayer = L.geoJSON(data, {
        style: {
          color: 'green',
          weight: 2,
          fillOpacity: 0.5
        },
        onEachFeature: function (feature, layer) {
          let popupContent = '';
          if (feature.properties && feature.properties.NOMBRE_PAR) {
            popupContent += `<strong>Parque:</strong> ${feature.properties.NOMBRE_PAR}<br>`;
            // Agregar todas las propiedades del parque
            for (const key in feature.properties) {
              if (key !== 'NOMBRE_PAR') {
                popupContent += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
              }
            }
          }
          // Ya no se agrega información del barrio
          layer.bindPopup(popupContent);
        }
      }).addTo(map);

      // Ajustar el zoom y el centro al área de los parques
      map.fitBounds(parquesLayer.getBounds());
    })
    .catch(error => console.error('Error al cargar el GeoJSON de parques:', error));
});
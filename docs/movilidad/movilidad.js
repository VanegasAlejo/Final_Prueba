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
fetch('Ruta_Sitp_Macarena.geojson')
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 7,
            fillColor: "#3494f497",
            color: "#0d47a1",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
          });
        },
        onEachFeature: function (feature, layer) {
          const props = feature.properties;
          let popupContent = `
            <strong>nombre_par:</strong> ${props.tipo_ruta_ || ''}<br>
            <strong>via_par:</strong> ${props.desc_tipo_ || ''}<br>
            <strong>direcc_par:</strong> ${props.abreviatur || ''}<br>
            <strong>locali_par:</strong> ${props.destino_zo || ''}<br>
            <strong>consola_pa:</strong> ${props.tipo_opera|| ''}<br>
            <strong>panel_par:</strong> ${props.operador_r || ''}<br>
          `;
          layer.bindPopup(popupContent);
        }
      }).addTo(map);
    })
    .catch(error => console.error('Error al cargar el GeoJSON de parques:', error));

  // Cargar y mostrar los puntos del sitp desde el archivo GeoJSON
  fetch('SITP_Macarena.geojson')
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 7,
            fillColor: "#1976d2",
            color: "#0d47a1",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
          });
        },
        onEachFeature: function (feature, layer) {
          const props = feature.properties;
          let popupContent = `
            <strong>nombre_par:</strong> ${props.nombre_par || ''}<br>
            <strong>via_par:</strong> ${props.via_par || ''}<br>
            <strong>direcc_par:</strong> ${props.direcc_par || ''}<br>
            <strong>locali_par:</strong> ${props.locali_par || ''}<br>
            <strong>consola_pa:</strong> ${props.consola_pa || ''}<br>
            <strong>panel_par:</strong> ${props.panel_par || ''}<br>
            <strong>audio_par:</strong> ${props.audio_par || ''}<br>
            <strong>longitud:</strong> ${props.longitud || ''}<br>
            <strong>latitud:</strong> ${props.latitud || ''}<br>
          `;
          layer.bindPopup(popupContent);
        }
      }).addTo(map);
    })
    .catch(error => console.error('Error al cargar el GeoJSON de parques:', error));
});

// Mostrar información adicional al hacer clic en el botón
document.getElementById('more-info-button').addEventListener('click', function() {
  const contentDiv = document.getElementById('content');
  contentDiv.classList.toggle('hidden');
});

// Configuración del mapa interactivo (opcional)
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar el mapa
  const map = L.map('map').setView([4.6567, -74.0558], 13); // Coordenadas aproximadas de La Macarena

  // Agregar capa base del mapa
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Agregar marcador o polígono del barrio (opcional)
  const barrioPolygon = [
    [-74.05, 4.65],
    [-74.06, 4.66],
    [-74.055, 4.665],
    [-74.05, 4.65]
  ];

  L.polygon(barrioPolygon, { color: 'red' }).addTo(map);
});
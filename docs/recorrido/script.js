// script.js
document.addEventListener("DOMContentLoaded", async () => {
  // Token de Cesium Ion
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3MTI1YTkyMi05MjA1LTQzNTgtYWM4OC0xN2JkZGU2NThlM2UiLCJpZCI6MzMxMzYxLCJpYXQiOjE3NTUwNDI1NjV9.ujK4d1Dyo4ltBmS5xJE_pLcFGUwRiAAsfFLzJDkCR3U';

  // Inicializar el visor de Cesium
  const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    }),
    timeline: false,
    animation: false,
    shadows: true,
    infoBox: false,
    selectionIndicator: false
  });
  viewer.scene.globe.depthTestAgainstTerrain = true;

  // Variables del recorrido
  let tourActive = false;
  let tourPaused = false;
  let currentIndex = 0;
  let tourInterval = null;

  try {
    // ========================
    // CARGA DEL BARRIO Y PREDIOS
    // ========================

    // Cargar GeoJSON del barrio
    const barrio = await Cesium.GeoJsonDataSource.load("Construccion_Macarena.geojson", {
      clampToGround: true
    });

    const entities = [...barrio.entities.values];
    if (entities.length === 0) {
      console.warn("⚠️ No se encontraron entidades en el GeoJSON.");
    } else {
      viewer.dataSources.add(barrio);

      // Estilo del contorno del barrio
      for (const e of entities) {
        if (e.polygon) {
          e.polygon.material = Cesium.Color.fromCssColorString("#1e88e5").withAlpha(0.2);
          e.polygon.outline = true;
          e.polygon.outlineColor = Cesium.Color.fromCssColorString("#1e88e5");
          e.polygon.outlineWidth = 4;
        }
      }
    }

    // Cargar predios con extrusión
    const predios = await Cesium.GeoJsonDataSource.load("Construccion_Macarena.geojson");
    viewer.dataSources.add(predios);

    let extruidos = 0;
    for (const e of predios.entities.values) {
      const pol = e.polygon;
      if (!pol) continue;

      const props = e.properties || {};
      const hasAltura = props.altura && !isNaN(+props.altura.getValue?.());
      const hasPisos = props.pisos && !isNaN(+props.pisos.getValue?.());
      const altura = hasAltura ? +props.altura.getValue() * 1.5
                : hasPisos  ? +props.pisos.getValue() * 3 * 1.5
                            : 6 * 1.5;

      pol.material = Cesium.Color.fromCssColorString("#2ecc40").withAlpha(0.9);
      pol.outline = true;
      pol.outlineColor = Cesium.Color.BLACK;
      pol.height = 1;
      pol.extrudedHeight = altura;
      pol.closeTop = true;
      pol.closeBottom = true;
      extruidos++;
    }
    console.log("✅ Edificios extruidos:", extruidos);

    // Edificios OSM
    const osm = await Cesium.createOsmBuildingsAsync();
    viewer.scene.primitives.add(osm);

    // Recorte al área del barrio
    if (entities.length > 0) {
      const polygonEntity = entities.find(e => e.polygon);
      if (polygonEntity) {
        const hierarchy = polygonEntity.polygon.hierarchy.getValue();
        const positions = hierarchy.positions;
  // Recorte manual del área del barrio (solo para CesiumJS estándar)
  // La función fromBoundingRectangle no existe, así que se omite el recorte
  // Si quieres recortar, debes crear los clipping planes manualmente

        // Enfocar al cargar
        const center = Cesium.BoundingSphere.fromPoints(positions).center;
        const carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(center);
        const lon = Cesium.Math.toDegrees(carto.longitude);
        const lat = Cesium.Math.toDegrees(carto.latitude);

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, 3200), // <-- Más altura, menos zoom
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-60) // <-- Más vertical, mejor perspectiva general
          },
          duration: 4
        });
      }
    }

    // ========================
    // RECORRIDO VIRTUAL
    // ========================

    const tourWaypoints = [
      { lon: -74.0661, lat: 4.6090, height: 2900, heading: 0,   pitch: -30, duration: 4 },
      { lon: -74.0733, lat: 4.6121, height: 2900, heading: 70,  pitch: -25, duration: 4 },
      { lon: -74.0710, lat: 4.6139, height: 2900,  heading: 100,  pitch: -20, duration: 4 },
      { lon: -74.0658, lat: 4.6202, height: 2900,  heading: 190, pitch: -10, duration: 4 },
      { lon: -74.0606, lat: 4.6138, height: 2900, heading: 270, pitch: -20, duration: 4 },

    ];

    function goToWaypoint(index) {
      const w = tourWaypoints[index];
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(w.lon, w.lat, w.height),
        orientation: {
          heading: Cesium.Math.toRadians(w.heading),
          pitch: Cesium.Math.toRadians(w.pitch),
          roll: 0.0
        },
        duration: w.duration,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT
      });
    }

    const startBtn = document.getElementById("startTour");
    const pauseBtn = document.getElementById("pauseTour");
    const resetBtn = document.getElementById("resetTour");

    startBtn.addEventListener("click", () => {
      if (!tourActive) {
        tourActive = true;
        tourPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
        goToWaypoint(currentIndex);

        tourInterval = setInterval(() => {
          if (!tourPaused) {
            currentIndex = (currentIndex + 1) % tourWaypoints.length;
            goToWaypoint(currentIndex);
          }
        }, 5000);
      } else if (tourPaused) {
        tourPaused = false;
        pauseBtn.textContent = "⏸️ Pausar";
      }
    });

    pauseBtn.addEventListener("click", () => {
      tourPaused = !tourPaused;
      pauseBtn.textContent = tourPaused ? "▶️ Reanudar" : "⏸️ Pausar";
    });

    resetBtn.addEventListener("click", () => {
      clearInterval(tourInterval);
      tourActive = false;
      tourPaused = false;
      currentIndex = 0;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      resetBtn.disabled = true;
      pauseBtn.textContent = "⏸️ Pausar";
      goToWaypoint(0);
    });

  } catch (error) {
    console.error("❌ Error al cargar los datos:", error);
    alert("Error al cargar el modelo 3D. Verifica que el archivo 'Construccion_Macarena.geojson' esté presente.");
  }

  // Elimina este bloque, ya que longitud y latitud no existen y la cámara ya se posiciona correctamente con flyTo
  // viewer.camera.setView({
  //   destination: Cesium.Cartesian3.fromDegrees(longitud, latitud, 500),
  //   orientation: {
  //       heading: Cesium.Math.toRadians(0),
  //       pitch: Cesium.Math.toRadians(-30),
  //       roll: 0
  //   }
  // });

  // Añadir marcadores después de inicializar el viewer
  const marcadores = [
    { lon: -74.0673, lat: 4.6133, nombre: "Torres del Parque", altura: 2725 },
    { lon: -74.0638, lat: 4.6136, nombre: "Universidad Distrital (Sede Macarena)", altura: 2760 },
    { lon: -74.0685, lat: 4.6132, nombre: "Plaza de toros", altura: 2670 },
    { lon: -74.0701, lat: 4.6108, nombre: "Torre colpatria", altura: 2865 },
    { lon: -74.0664, lat: 4.6138, nombre: "Restaurante La Juguetería", altura: 2675 },
    { lon: -74.0660, lat: 4.6147, nombre: "Restaurante El Patio", altura: 2677 },
    { lon: -74.0667, lat: 4.6120, nombre: "Restaurante La Chocolatería", altura: 2680 }
  ];

  marcadores.forEach(m => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(m.lon, m.lat, m.altura), // Usa la altura personalizada
      billboard: {
        image: 'pin.png',
        width: 32,
        height: 32,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM
      },
      label: {
        text: m.nombre,
        font: '20px Times New Roman, serif',
        fillColor: Cesium.Color.BLACK,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, 20)
      }
    });
  });

});
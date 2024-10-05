// Inicializa el mapa centrado en Hermosillo y restringe el zoom
var map = L.map('map').setView([29.0729, -110.9559], 12); // Coordenadas de Hermosillo
map.setMinZoom(12); // Evita hacer zoom out más allá de la ciudad

// Establecer límites del mapa para que no se pueda mover más allá de Hermosillo
var bounds = L.latLngBounds(
    L.latLng(29.0, -111.1), // Esquina suroeste
    L.latLng(29.2, -110.8)  // Esquina noreste
);
map.setMaxBounds(bounds); // Establecer límites máximos


// Agrega una capa de mapas base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Objeto para almacenar las capas GeoJSON
var geojsonLayers = {};

// Estilos para cada capa
var geojsonStyles = {
    layer1: { color: "#ff0000" }, // Rojo
    layer2: { color: "#00ff00" }, // Verde
    layer3: { color: "#0000ff" }, // Azul
    layer4: { color: "#ffff00" }  // Amarillo
};

// Función para manejar cada característica
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

// Cargar capas GeoJSON
function loadGeoJSON(url, layerId) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            geojsonLayers[layerId] = L.geoJSON(data, {
                style: geojsonStyles[layerId], // Aplica el estilo correspondiente
                onEachFeature: onEachFeature
            }).addTo(map); // Agrega la capa al mapa inicialmente
        })
        .catch(error => console.error('Error cargando el archivo GeoJSON:', error));
}

// Cargar las cuatro capas GeoJSON
loadGeoJSON('bls/arroyos.geojson', 'layer1');
loadGeoJSON('bls/cuencas.geojson', 'layer2');
loadGeoJSON('bls/drenaje.geojson', 'layer3');
loadGeoJSON('bls/peligros.geojson', 'layer4');

// Manejar los eventos de cambio en los cuadros de verificación
document.getElementById('layer1').addEventListener('change', function() {
    if (this.checked) {
        map.addLayer(geojsonLayers['layer1']);
    } else {
        map.removeLayer(geojsonLayers['layer1']);
    }
});

document.getElementById('layer2').addEventListener('change', function() {
    if (this.checked) {
        map.addLayer(geojsonLayers['layer2']);
    } else {
        map.removeLayer(geojsonLayers['layer2']);
    }
});

document.getElementById('layer3').addEventListener('change', function() {
    if (this.checked) {
        map.addLayer(geojsonLayers['layer3']);
    } else {
        map.removeLayer(geojsonLayers['layer3']);
    }
});

document.getElementById('layer4').addEventListener('change', function() {
    if (this.checked) {
        map.addLayer(geojsonLayers['layer4']);
    } else {
        map.removeLayer(geojsonLayers['layer4']);
    }
});


var geojsonButtonAr = L.control({position: 'topright'});

geojsonButtonAr.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'geojson-control');
    div.innerHTML = '<button id="toggle-geojson">Mostrar/Ocultar Arroyos</button>';
    div.firstChild.onclick = function() {
        if (map.hasLayer(layer1)) {
            map.removeLayer(layer1);
        } else {
            layer1.addTo(map);
        }
    };
    return div;
};
geojsonButtonAr.addTo(map);


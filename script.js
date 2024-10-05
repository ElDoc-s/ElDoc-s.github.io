// Inicializa el mapa y centra en Hermosillo

var arroyos = {
    "color": "#0000ff" // Azul
};

var peligros = {
	"color": "#ff0000" // Rojo
};

var drenaje = {
	"color": "#00ff00" // Verde
};

var cuencas = {
	"color": "#ffff00" // Amarillo
};


var map = L.map('map').setView([29.0729, -110.9559], 12); // Coordenadas de Hermosillo

// Agrega una capa de mapas base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Establecer límites del mapa para que no se pueda mover más allá de Hermosillo
var bounds = L.latLngBounds(
    L.latLng(29.0, -111.1), // Esquina suroeste
    L.latLng(29.2, -110.8)  // Esquina noreste
);
map.setMaxBounds(bounds); // Establecer límites máximos
map.setMinZoom(12); // Evita hacer zoom out más allá de la ciudad

// Capa GeoJSON
var lDrenaje;

// Función para manejar cada característica
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

// Cargar el archivo GeoJSON y crear la capa
fetch('bls/drenaje.geojson')
    .then(response => response.json())
    .then(data => {
        lDrenaje = L.geoJSON(data, {
            onEachFeature: onEachFeature,
		style: drenaje
        });
    })
    .catch(error => console.error('Error cargando el archivo GeoJSON:', error));

// Botón para activar/desactivar la capa GeoJSON
var geojsonButton = L.control({position: 'topright'});

geojsonButton.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'geojson-control');
    div.innerHTML = '<button id="toggle-geojson">Mostrar/Ocultar drenaje</button>';
    div.firstChild.onclick = function() {
        if (map.hasLayer(lDrenaje)) {
            map.removeLayer(lDrenaje);
        } else {
            lDrenaje.addTo(map);
        }
    };
    return div;
};
geojsonButton.addTo(map);

var lCuencas;

fetch('bls/cuencas.geojson')
    .then(response => response.json())
    .then(data => {
        lCuencas = L.geoJSON(data, {
            onEachFeature: onEachFeature,
		style: cuencas
        });
    })
    .catch(error => console.error('Error cargando el archivo GeoJSON:', error));

// Botón para activar/desactivar la capa GeoJSON
var geojsonButtonCu = L.control({position: 'topright'});

geojsonButtonCu.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'geojson-control');
    div.innerHTML = '<button id="toggle-geojson">Mostrar/Ocultar cuencas</button>';
    div.firstChild.onclick = function() {
        if (map.hasLayer(lCuencas)) {
            map.removeLayer(lCuencas);
        } else {
            lCuencas.addTo(map);
        }
    };
    return div;
};
geojsonButtonCu.addTo(map);

var lPeligros;

fetch('bls/peligros.geojson')
    .then(response => response.json())
    .then(data => {
        lPeligros = L.geoJSON(data, {
            onEachFeature: onEachFeature,
		style: peligros
        });
    })
    .catch(error => console.error('Error cargando el archivo GeoJSON:', error));

// Botón para activar/desactivar la capa GeoJSON
var geojsonButtonPe = L.control({position: 'topright'});

geojsonButtonPe.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'geojson-control');
	
    div.innerHTML = '<button id="toggle-geojson">Mostrar/Ocultar Peligros</button>';
    div.firstChild.onclick = function() {
        if (map.hasLayer(lPeligros)) {
            map.removeLayer(lPeligros);
        } else {
            lPeligros.addTo(map);
        }
    };
    return div;
};
geojsonButtonPe.addTo(map);

var lArroyos;


fetch('bls/arroyos.geojson')
    .then(response => response.json())
    .then(data => {
        lArroyos = L.geoJSON(data, {
            onEachFeature: onEachFeature,
		style: arroyos 
        });
    })
    .catch(error => console.error('Error cargando el archivo GeoJSON:', error));

// Botón para activar/desactivar la capa GeoJSON
var geojsonButtonAr = L.control({position: 'topright'});

geojsonButtonAr.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'geojson-control');
    div.innerHTML = '<button id="toggle-geojson">Mostrar/Ocultar Arroyos</button>';
    div.firstChild.onclick = function() {
        if (map.hasLayer(lArroyos)) {
            map.removeLayer(lArroyos);
        } else {
            lArroyos.addTo(map);
        }
    };
    return div;
};
geojsonButtonAr.addTo(map);

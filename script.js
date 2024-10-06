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

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

var otm = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{
    maxZoom:19,
    attribution: '© OpenTopoMap'
 
});

var map = L.map('map', {
    center: [39.73, -104.99],
    zoom: 10,
    layers: [osm]
});

// Establecer límites del mapa para que no se pueda mover más allá de Hermosillo
var bounds = L.latLngBounds(
    L.latLng(29.0, -111.1), // Esquina suroeste
    L.latLng(29.2, -110.8)  // Esquina noreste
);
map.setMaxBounds(bounds); // Establecer límites máximos
map.setMinZoom(12); // Evita hacer zoom out más allá de la ciudad



var lDrenaje = new L.GeoJSON.AJAX("bls/drenaje.geojson", {style: drenaje});
var lCuencas = new L.GeoJSON.AJAX("bls/cuencas.geojson", {style: cuencas});       
var lArroyos = new L.GeoJSON.AJAX("bls/arroyos.geojson", {style: arroyos});       
var lPeligros = new L.GeoJSON.AJAX("bls/peligros.geojson",{style: peligros});       

var baseMaps = {
    "Street View": osm,
    "Topographic View": otm

};

var overlayMaps = {
    "Sewage Systems": lDrenaje,
    "Basins": lCuencas,
    "Streams": lArroyos,
    "Hazardous Areas": lPeligros,
};


var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

var control = L.Routing.control({
    waypoints: [],
    createMarker: function(i, waypoint, n) {
        var marker = L.marker(waypoint.latLng);
        return marker;
    },
    router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
    })
}).addTo(map);

// Manejar los clics en el mapa para seleccionar puntos de inicio y destino
map.on('click', function(e) {
    var waypoints = control.getWaypoints();

    if (waypoints[0].latLng === null) {
        waypoints[0].latLng = e.latlng;  // Establecer el punto de inicio
    } else if (waypoints[1].latLng === null) {
        waypoints[1].latLng = e.latlng;  // Establecer el punto de destino
        control.setWaypoints(waypoints); // Actualizar la ruta
        avoidZonesRouting(waypoints[0].latLng, waypoints[1].latLng);
    } else {
        // Reiniciar los puntos
        control.setWaypoints([]);
    }
});

// Función para calcular rutas evitando zonas
function avoidZonesRouting(start, end) {
    // Obtener la ruta original
    control.getRouter().route([
        L.Routing.waypoint(start),
        L.Routing.waypoint(end)
    ], function(err, routes) {
        if (routes) {
            var route = routes[0].coordinates;
            var intersects = false;

            // Verificar si la ruta pasa por alguna zona restringida
            for (var i = 0; i < avoidZones.features.length; i++) {
                var zone = avoidZones.features[i];

                for (var j = 0; j < route.length; j++) {
                    var point = [route[j].lng, route[j].lat];

                    if (turf.booleanPointInPolygon(point, zone)) {
                        intersects = true;
                        break;
                    }
                }

                if (intersects) {
                    break;
                }
            }

            if (intersects) {
                alert("La ruta planeada pasa por una zona restringida. Recalculando...");
                recalculateRouteAvoidingZones(start, end);
            } else {
                control.setWaypoints([start, end]);  // Dibujar la ruta
            }
        }
    });
}

// Función para recalcular ruta evitando zonas (a implementar)
function recalculateRouteAvoidingZones(start, end) {
    // Aquí puedes añadir la lógica para recalcular la ruta evitando las zonas
    alert("Ruta recalculada evitando las zonas");
}

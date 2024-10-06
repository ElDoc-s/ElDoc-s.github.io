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

    // Array to store warning markers
    var warningMarkers = [];

    // Manejar los clics en el mapa para seleccionar puntos de inicio y destino
    map.on('click', function(e) {
        var waypoints = control.getWaypoints();

        if (!waypoints[0].latLng) {
            waypoints[0].latLng = e.latlng;  // Establecer el punto de inicio
        } else if (!waypoints[1].latLng) {
            waypoints[1].latLng = e.latlng;  // Establecer el punto de destino
            control.setWaypoints(waypoints); // Actualizar la ruta
            checkRouteIntersection(waypoints[0].latLng, waypoints[1].latLng);
        } else {
            // Reiniciar los puntos
            control.setWaypoints([]);
            // Remove any existing warning markers when no route is drawn
            removeWarningMarkers();
        }
    });

    // Función para verificar si la ruta pasa por alguna zona peligrosa
    function checkRouteIntersection(start, end) {
        // Remove existing warning markers whenever a new route is drawn
        removeWarningMarkers();

        control.getRouter().route([
            L.Routing.waypoint(start),
            L.Routing.waypoint(end)
        ], function(err, routes) {
            if (routes) {
                var route = routes[0].coordinates;
                var hazards = lPeligros.toGeoJSON(); // Convertir el layer a GeoJSON
                var intersects = false;

                // Iterar sobre cada punto de la ruta
                for (var i = 0; i < route.length; i++) {
                    var point = turf.point([route[i].lng, route[i].lat]);

                    // Iterar sobre cada zona peligrosa
                    for (var j = 0; j < hazards.features.length; j++) {
                        var hazardZone = hazards.features[j];

                        // Verificar si el punto está dentro de la zona peligrosa
                        if (turf.booleanPointInPolygon(point, hazardZone)) {
                            intersects = true;
                            // Colocar un marcador de advertencia en el punto de intersección
                            var warningMarker = L.marker([route[i].lat, route[i].lng], {
                                icon: L.divIcon({
                                    className: 'warning-icon',
                                    html: '<i style="color: red; font-size: 24px;">⚠️</i>',
                                    iconSize: [30, 30]
                                })
                            }).addTo(map);

                            // Mostrar el popup con la advertencia
                            warningMarker.bindPopup("<b>Warning:</b> The route provided intersects a flood risk area.").openPopup();

                            // Add the warning marker to the array
                            warningMarkers.push(warningMarker);

                            break;
                        }
                    }

                    if (intersects) {
                        break; // Si ya se encontró la intersección, salimos del loop
                    }
                }
            }
        });
    }

    // Function to remove all warning markers
    function removeWarningMarkers() {
        for (var i = 0; i < warningMarkers.length; i++) {
            map.removeLayer(warningMarkers[i]);
        }
        warningMarkers = [];  // Clear the array after removing markers
    }
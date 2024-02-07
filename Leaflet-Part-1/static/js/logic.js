// Define API endpoint URL
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to determine color based on depth
function getColor(depth) {
    return depth > 90 ? '#FF0000' :
    depth > 70 ? '#FF5733' :
    depth > 50 ? '#FFC300' :
    depth > 30 ? '#FFFF00' :
    depth > 10 ? '#ADFF2F' :
    '#00FF00';
}
// ------------------------------------------------------------------------------------------ //

// Request data from the queryUrl
d3.json(queryUrl).then(function (data) {
  // Send the data to the createEarthquakeFeatures function
  createEarthquakeFeatures(data.features);
});
// ------------------------------------------------------------------------------------------ //

// Function to create earthquake features
function createEarthquakeFeatures(earthquakeData) {
  // Define a function to run for each feature and assign popups
  function forEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.mag)}</p><hr><p>${new Date(feature.geometry.coordinates[2])}</p>`);
  }

  // Create a GeoJSON layer with forEachFeature function
  let earthquakeLayer = L.geoJSON(earthquakeData, {
    forEachFeature: forEachFeature
  });

  // Send earthquake layer to the createMap function
  createMap(earthquakeLayer);
}
// ------------------------------------------------------------------------------------------ //

// Function to create the map
function createMap(earthquakeLayer) {
  // Define base layers
  let lightMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });
  // Define base and overlay maps
  let baseMaps = {
    "Light Map": lightMap,
    "Topographic Map": topoMap
  };
  let overlayMaps = {
    Earthquakes: earthquakeLayer
  };
  // Create the map
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [lightMap, earthquakeLayer]
  });
  // Add layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  // Create legend
  let legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {
      let div = L.DomUtil.create('div', 'info legend');
      let depths = [-10, 10, 30, 50, 70, 90];

      let legendHeader = '<h3> Earthquake Depth </h3><hr>'
          div.innerHTML = legendHeader;
      for (var i = 0; i < depths.length; i++) {
          // Create legend items with corresponding colors based on depth
          div.innerHTML +=
              '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' + depths[i] + (depths[i + 1] ? ' - ' + depths[i + 1] + '<br>' : ' + ');
      };
      return div;
  };
  legend.addTo(myMap);
}
// ------------------------------------------------------------------------------------------ //

// Function to create earthquake features
function createEarthquakeFeatures(data) {
  // Define a function to run for each feature and assign popups
  function forEachFeature(feature, layer) {
    // Popup content displaying earthquake place, depth, and magnitude
    layer.bindPopup('<h2>' + feature.properties.place + '</h2><hr><h4>Depth: ' + (feature.geometry.coordinates[2]) + '</h4><h4>Magnitude: ' + feature.properties.mag + '</h4>');
  }
  // Create a GeoJSON layer with onEachFeature and pointToLayer functions
  let layerToMap = L.geoJSON(data, {
    onEachFeature: forEachFeature,
    pointToLayer: function(feature, latlng) {
      // Calculate radius based on earthquake magnitude
      let radius = feature.properties.mag * 4.5;
      let depth = feature.geometry.coordinates[2];
      // Create circle marker with corresponding color based on depth
      return L.circleMarker(latlng, {
        radius: radius,
        color: 'black',
        fillColor: getColor(depth),
        fillOpacity: 0.65,
        weight: 1
      });
    }
  });
  // Send layerToMap to the createMap function
  createMap(layerToMap);
}

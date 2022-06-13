import Feature from 'ol/Feature';
import Map from 'ol/Map';
import {OSM, Vector as VectorSource} from 'ol/source';
import View from 'ol/View';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {ZoomToExtent, OverviewMap, defaults as defaultControls} from 'ol/control';
import Overlay from 'ol/Overlay';

// Contants for literals
const migrationRoutes = ['Afghanistan to Iran', 'Belarus-EU border', 'Caribbean to US', 'Central Mediterranean', 'Central Mediterranean,US-Mexico border crossing', 'Comoros to Mayotte', 'Darien Gap', 'Dominican Republic to Puerto Rico', 'DRC to Uganda', 'Eastern Mediterranean', 'English Channel to the UK', 'Haiti to Dominican Republic', 'Horn of Africa to Yemen crossing', 'Iran to Turkey', 'Italy to France', 'Sahara Desert crossing', 'Syria to Turkey', 'Turkey-Europe land route', 'Ukraine to Europe', 'US-Mexico border crossing', 'Venezuela to Caribbean', 'Western Africa / Atlantic route to the Canary Islands', 'Western Balkans', 'Western Mediterranean'];

// Colors
const colors = ['#3982D0', '#D96D73', '#5A59A6', '#6DB6A1', '#F78B41', '#5DB9E0', '#418A8B', '#A2578D', '#E5B75D',
  '#234E63', '#90B9E5', '#A74460', '#A2A2CD', '#50826F', '#FABD94', '#3B98AB', '#8AC7C8', '#6D466B'];

// Constants with colors
const styles = [];

// Load colors in constants
for (let i = 0; i<colors.length; i++) {
  styles.push(
      new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({color: colors[i]}),
          stroke: new Stroke({color: '#666666', width: 1})
        }),
      })
  );
}

function getElementFromConstantOrder(constant, constantList, destinationList) {
  const index = constantList.indexOf(constant) || 0;
  return destinationList[index % destinationList.length];
}

var data;
var filteredData;
function loadData() {
  var csvFile = 'https://missingmigrants.iom.int/sites/g/files/tmzbdl601/files/report-migrant-incident/Missing_Migrants_Global_Figures_allData.csv';
  $.ajax({
    type: "GET",
    url: csvFile,
    dataType: "text",
    success: function(response) {
      data = $.csv.toObjects(response);
      loadMap(data);
    }
  });
}

function search() {
  if (!data) {
    loadData();
  } else {
    const migrationRoute = $('#fieldMigrationRoute').find(":selected").val();
    const originRegion = $('#fieldRegionOrigin').find(":selected").val();
    const deathCause = $('#fieldDeathCause').find(":selected").val();
    const incidentRegion = $('#fieldIncidentRegion').find(":selected").val();

    filteredData = new Array();
    for (let i = 0; i < data.length; ++i) {
      let include = true;
      if (migrationRoute && data[i]["Migration route"] !== migrationRoute) {
        include = false;
      } else if (originRegion && data[i]["Region of Origin"] !== originRegion) {
        include = false;
      } else if (deathCause && data[i]["Cause of Death"] !== deathCause) {
        include = false;
      } else if (incidentRegion && data[i]["Region of Incident"] !== incidentRegion) {
        include = false;
      }
      if (include) {
        filteredData.push(data[i]);
      }
    }
    loadMap(filteredData);
  }
}

$("#searchButton").click(function() {
  search();
});


const projection = 'EPSG:3857';

var map, vectorLayer, vectorSource;

function loadMap(data) {
  let geojsonObject = {
    "type":"FeatureCollection",
    "crs":{
      "type":"name",
      "properties":{
        "name": projection
      }
    },
    "features":[]
  }

  const features = new Array();
  let totalDeath = 0;
  let totalWomen = 0;
  let totalChildren = 0;
  const max = data.length;
  for (let i = 0; i < data.length && i < max; ++i) {
    const coordinates = data[i].Coordinates;
    if (coordinates) {
      const latLong = coordinates.substring('POINT('.length + 1, coordinates.length - 1).split(' ');
      const latitude = latLong[0] * 100000;
      const longitude = latLong[1] * 100000;
      geojsonObject.features.push({
        "type":"Feature",
        "geometry":{
          "type":"Point",
          "coordinates":[
            latitude,
            longitude
          ]
        },
        "properties": {
          "originRegion": data[i]["Region of Origin"],
          "incidentRegion": data[i]["Region of Incident"],
          "year": data[i]["Incident year"],
          "month": data[i]["Reported Month"],
          "numDeathMissing": data[i]["Total Number of Dead and Missing"],
          "numSurvivors": data[i]["Number of Survivors"],
          "migrationRoute": data[i]["Migration route"],
          "deathLocation": data[i]["Location of death"],
          "articleTitle": data[i]["Article title"],
          "mainId": data[i]["Main ID"],
          "numDeathFemales": data[i]["Number of Females"],
          "numDeathMales": data[i]["Number of Males"],
          "numDeathChildren": data[i]["Number of Children"],
          "deathCause": data[i]["Cause of Death"]
        }
      });
    }
    totalDeath += Number(data[i]["Total Number of Dead and Missing"]) || 0;
    totalWomen += Number(data[i]["Number of Females"]) || 0;
    totalChildren += Number(data[i]["Number of Children"]) || 0;
  }
  console.log(geojsonObject);

  vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(geojsonObject)
    });

  const styleFunction = function (feature) {
    return getElementFromConstantOrder(feature.getProperties()["migrationRoute"], migrationRoutes, styles);
  };

  if (!vectorLayer) {
    vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction
    });
  } else {
    vectorLayer.setSource(vectorSource);
    vectorLayer.getSource().changed();
  }

  const layers = [new TileLayer({
    source: new OSM(),
  }), vectorLayer];

  const overviewMapControl = new OverviewMap({
    layers: layers,
  });

  if (!map) {
    map = new Map({
      layers: layers,
      target: document.getElementById('map'),
      view: new View({
        center: [40, 0],
        zoom: 1,
        projection: projection
      }),
      controls: defaultControls().extend([
        overviewMapControl
      ]),
    });
    const popupElement = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    const tableContent = document.getElementById('table-content');
    const closer = document.getElementById('popup-closer');

    const popup = new Overlay({
      element: popupElement,
      positioning: 'bottom-center',
      stopEvent: false,
      autoPan: {
        animation: {
          duration: 250,
        },
      }
    });

    map.addOverlay(popup);

    closer.onclick = function () {
      popup.setPosition(undefined);
      popupContent.innerHTML = '';
      tableContent.innerHTML = '';
      closer.blur();
      return false;
    };

    // display popup on click
    map.on('click', function (evt) {
      const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
      });
      if (feature) {
        popup.setPosition(evt.coordinate);
        popupContent.innerHTML = '<div class="row justify-content-center">\n' +
            '<div class="col-auto">\n' +
            '<table class="table table-responsive">\n' +
            '  <tbody>\n' +
            '    <tr>\n' +
            '      <th scope="row">Dead and missing</th>\n' +
            '      <td>' + feature.getProperties()["numDeathMissing"] || 'N/A' + '</td>\n' +
            '      <th scope="row">Survivors</th>\n' +
            '      <td>' + feature.getProperties()["numSurvivors"] || 'N/A' + '</td>\n' +
            '    </tr>\n' +
            '    <tr>\n' +
            '      <th scope="row">Females dead</th>\n' +
            '      <td>' + feature.getProperties()["numDeathFemales"] || 'N/A' + '</td>\n' +
            '      <th scope="row">Childrens dead</th>\n' +
            '      <td>' + feature.getProperties()["numDeathChildren"] || 'N/A' + '</td>\n' +
            '    </tr>\n' +
            '  </tbody>\n' +
            '</table>' +
            '<a href="#table-content" class="link-info">More info</a>' +
            '</div></div>';
        tableContent.innerHTML = '<table class="table">\n' +
            '  <tbody>\n' +
            '    <tr>\n' +
            '      <th scope="row">Region of Origin</th>\n' +
            '      <td>' + feature.getProperties()["originRegion"] + '</td>\n' +
            '      <th scope="row">Region of Incident</th>\n' +
            '      <td>' + feature.getProperties()["incidentRegion"] + '</td>\n' +
            '    </tr>\n' +
            '    <tr>\n' +
            '      <th scope="row">Incident year</th>\n' +
            '      <td>' + feature.getProperties()["year"] + '</td>\n' +
            '      <th scope="row">Reported Month</th>\n' +
            '      <td>' + feature.getProperties()["month"] + '</td>\n' +
            '    </tr>\n' +
            '    <tr>\n' +
            '      <th scope="row">Total Number of Dead and Missing</th>\n' +
            '      <td>' + feature.getProperties()["numDeathMissing"] + '</td>\n' +
            '      <th scope="row">Number of Survivors</th>\n' +
            '      <td>' + feature.getProperties()["numSurvivors"] + '</td>\n' +
            '    </tr>\n' +
            '    <tr>\n' +
            '      <th scope="row">Number of Females Death</th>\n' +
            '      <td>' + feature.getProperties()["numDeathFemales"] + '</td>\n' +
            '      <th scope="row">Number of Children Death</th>\n' +
            '      <td>' + feature.getProperties()["numDeathChildren"] + '</td>\n' +
            '    </tr>\n' +
            '    <tr>\n' +
            '      <th scope="row">Migration route</th>\n' +
            '      <td>' + feature.getProperties()["migrationRoute"] + '</td>\n' +
            '      <th scope="row">Location of death</th>\n' +
            '      <td>' + feature.getProperties()["deathLocation"] + '</td>\n' +
            '    </tr>\n' +
            '    <tr>\n' +
            '      <th scope="row">Article title</th>\n' +
            '      <td>' + feature.getProperties()["articleTitle"] + '</td>\n' +
            '    </tr>\n' +
            '  </tbody>\n' +
            '</table>'
      }
    });
  }

  updateTotalNumbers(totalDeath, totalWomen, totalChildren);
  map.updateSize();
}

function updateTotalNumbers(totalDeath, totalWomen, totalChildren) {
  $("#totalDeathMissing").text(totalDeath);
  $("#totalWomen").text(totalWomen);
  $("#totalChildren").text(totalChildren);
}

search();
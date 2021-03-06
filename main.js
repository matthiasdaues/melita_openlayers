// ToDo
// popup on location
// popup on coverage area
// location with coverage overlay on click
// legend
// basemapswitcher
// layer picker

// import required modules

// modules
// import './controls';

// css
import './style.css';
import "ol-ext/dist/ol-ext.css";

// fundaments
import {Feature, Map, View} from 'ol';
import Point from 'ol/geom/Point';

// performance
import {bbox as bboxStrategy} from 'ol/loadingstrategy';

// formats
import GeoJSON from 'ol/format/GeoJSON';



// controls
import {defaults as defaultControls, OverviewMap, ZoomToExtent} from 'ol/control';
import ScaleLine from 'ol/control/ScaleLine';
import MousePosition from 'ol/control/MousePosition';
import ol_control_Legend from 'ol-ext/control/Legend';
import ol_legend_Legend from 'ol-ext/legend/Legend';

// sources
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import ImageWMS from 'ol/source/ImageWMS';
import TileWMS from 'ol/source/TileWMS';
import OSM from 'ol/source/OSM';
import GeoTIFF from 'ol/source/GeoTIFF'

// layer types
import {Image as ImageLayer, Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';

// vector tile layer
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';

// geoinformation and projections
import {createStringXY} from 'ol/coordinate';
import {fromLonLat} from 'ol/proj';
import {toLonLat} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate';

// styles
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style';
import { red } from 'nanocolors';
import { multiply } from 'ol/transform';

// interactions
import Select from 'ol/interaction/Select';

// overlays und popups
import Overlay from 'ol/Overlay';
import PopupFeature from "ol-ext/overlay/PopupFeature";
import ol_legend_Item from 'ol-ext/legend/Item';


// 00 define basemaps
// 00 1 basemaps from carto
const cartoLightAll = new TileLayer({
    source: new XYZ({
      url:'http://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
    })
});
// 00 2 basemaps from ESRI
// 00 3 basemaps from OSM


// 01 extents, layout and styles
// 01 1 center in WGS84 and reprojection to webmercator
const melitaLonLat = [9.5, 51.35];
const melitaWebMercator = fromLonLat(melitaLonLat);

// 01 2 styles
// 01 2 1 gateway locations styles
// 01 2 1 1 active gateway
const locationStyleActive = new Style({
  image: new CircleStyle({
    radius: 4,
    fill: new Fill({color: '#39ffca'}),
    stroke: new Stroke({color: '#076859', width: 0.5}),
  })
});
// 01 2 1 2 inactive gateway
const locationStyleInactive = new Style({
  image: new CircleStyle({
    radius: 2,
    fill: new Fill({color: 'lightgrey'}),
    stroke: new Stroke({color: '#076859', width: 0.5}),
  }),
});
// 01 2 1 3 dynamic gateway location style by status
const locationStyle = function (feature) {
  const gateway_status = feature.get('status');
  const styleTable = {
    "0": locationStyleInactive,
    "1": locationStyleActive,
    "2": locationStyleActive,
  };
  return styleTable[
    gateway_status || "0"
  ]
};
// 01 2 2 coverage styles
// 01 2 2 1 potential coverage over all available locations
const potentialCoverageStyle = new Style({
  fill: new Fill({color: 'rgba( 42, 177, 184, 0.5 )'}),
  stroke: new Stroke({color: 'rgba( 42, 177, 184, 1.00 )', width: 0.5})
});
// 01 2 2 2 active coverage
const active120 = new Style({ fill: new Fill({color: 'rgba( 107, 176, 175, 1 )'})})
const active110 = new Style({ fill: new Fill({color: 'rgba( 171, 221, 164, 1 )'})})
const active100 = new Style({ fill: new Fill({color: 'rgba( 213, 238, 178, 1 )'})})
const active90 = new Style({ fill: new Fill({color: 'rgba( 255, 255, 191, 1 )'})})
const active80 = new Style({ fill: new Fill({color: 'rgba( 254, 215, 144, 1 )'})})
const active70 = new Style({ fill: new Fill({color: 'rgba( 253, 174, 97, 1 )'})})
const active60 = new Style({ fill: new Fill({color: 'rgba( 234, 99, 62, 1 )'})})
const active50 = new Style({ fill: new Fill({color: 'rgba( 215, 25, 28, 1 )'})})
const activeCoverageStyle = function (feature) {
  const styleTable = {
    "-120": active120,
    "-110": active110,
    "-100": active100,
    "-90": active90,
    "-80": active80,
    "-70": active70,
    "-60": active60,
    "-50": active50,
  };
  return styleTable[feature.get("dbm")]
};
// 01 2 2 3 indoor and outdoor coverage
const outdoor = new Style({ fill: new Fill({color: 'rgba( 171, 221, 164, 0.8 )'})})
const indoor = new Style({ fill: new Fill({color: 'rgba( 254, 215, 144, 0.8 )'})})
const indoorOutdoorCoverageStyle = function (feature) {
  const styleTable = {
    "-120": outdoor,
    "-110": outdoor,
    "-100": outdoor,
    "-90": indoor,
    "-80": indoor,
    "-70": indoor,
    "-60": indoor,
    "-50": indoor,
  };
  return styleTable[feature.get("dbm")]
};


// 02 define layers and content
// 02 1 vector layers
// 02 1 1 Gateway-Locations as WFS
const gatewayLocationsWFS = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url:'http://localhost:8080/geoserver/ows?service=wfs&' +
        'version=1.1.0&request=GetFeature&typename=melita:location&' +
        'outputFormat=application/json&srsname=EPSG:3857&'
    }),
  style: locationStyle
});
// 02 1 2 Gateway-Locations as WMS
// 02 1 3 Potential Coverage as WFS
// 02 1 4 Active Coverage as WFS
// 02 1 5 active coverage as Vector Tile Layer
// 02 1 6 potential coverage as Vector Tile Layer
// 02 1 7 indoor-outdoor coverage as Vector Tile Layer
const indoorOutdoorCoverage = new VectorTileLayer({
  className: 'indoorOutdoorCoverage',
  source: new VectorTileSource({
    format: new MVT(),
    url: 
    'http://localhost:8080/geoserver/gwc/service/tms/1.0.0/melita%3Apotential_coverage_test@EPSG%3A3857@pbf/{z}/{x}/{-y}.pbf',
    maxZoom: 21,
  }),
  style: indoorOutdoorCoverageStyle, 
});
indoorOutdoorCoverage.setProperties({
  hello: "hello",
  world: "World!"
});
// 02 1 7 locations as Vector Tile Layer


// Elements that make up the popup. 
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

// Create an overlay to anchor the popup to the map.
const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

// // Add a click handler to hide the popup.
// // @return {boolean} Don't follow the href.
// closer.onclick = function () {
//   overlay.setPosition(undefined);
//   closer.blur();
//   return false;
// };




// put all on a map
const map = new Map({
  target: 'map',
  layers: [
      cartoLightAll,
      indoorOutdoorCoverage,
//      activeCoverageMVT,
      gatewayLocationsWFS
  ],
  overlays: [overlay],
  view: new View({
    center: melitaWebMercator,
    zoom: 6,
  }),
});

map.on('singleclick', function(evt) {
  var name = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
    return feature.get('name');
  })
  if (name) {
    container.style.display="block";
    var coordinate = evt.coordinate;
    content.innerHTML = name;
    overlay.setPosition(coordinate);
  } else {
    container.style.display="none";
  }
});
map.on('pointermove', function(evt) {
  map.getTargetElement().style.cursor = map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
});


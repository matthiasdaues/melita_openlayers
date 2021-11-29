// import required modules

// css
import './style.css';

// fundaments
import {Feature, Map, View} from 'ol';

// performance
import {bbox as bboxStrategy} from 'ol/loadingstrategy';

// formats
import GeoJSON from 'ol/format/GeoJSON';

// controls
import {defaults as defaultControls} from 'ol/control';
import MousePosition from 'ol/control/MousePosition';

// sources
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import ImageWMS from 'ol/source/ImageWMS';
import TileWMS from 'ol/source/TileWMS';
import OSM from 'ol/source/OSM';
import GeoTIFF from 'ol/source/GeoTIFF'

// layer types
import {Image as ImageLayer, Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';

// geoinformation and projections
import {createStringXY} from 'ol/coordinate';
import {fromLonLat} from 'ol/proj';

// styles
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import { red } from 'nanocolors';


// 00 define basemaps
// 00 1 basemaps from carto
const cartoLightAll = new TileLayer({
    source: new XYZ({
      url:'http://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
    })
});
const cartoDarkAll = new TileLayer({
    source: new XYZ({
      url:'http://{1-4}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
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
  })
});
// 01 2 1 3 dynamic gateway location style by status
const locationStyle = function (feature) {
  const styleTable = {
    "0": locationStyleInactive,
    "1": locationStyleActive,
    "2": locationStyleActive
  };
  return styleTable[feature.get("status")] || locationStyleInactive
};
// 01 2 2 coverage styles
// 01 2 2 1 potential coverage over all available locations
const potentialCoverageStyle = new Style({
  fill: new Fill({color: 'rgba( 42, 177, 184, 0.20 )'}),
  stroke: new Stroke({color: 'rgba( 42, 177, 184, 1.00 )', width: 0.5})
});

// 02 define layers and content
// 02 1 vector layers
// 02 1 1 Gateway-Locations as WFS
const gatewayLocationsWFS = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url:'http://localhost:8080/geoserver/ows?service=wfs&' +
        'version=1.1.0&request=GetFeature&typename=melita:mv_gateways&' +
        'outputFormat=application/json&srsname=EPSG:3857&'
    }),
  style: locationStyle
});
// 02 1 2 Gateway-Locations as WMS
const gatewayLocationsWMS = new TileLayer({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/melita/wms',
    params: {'LAYERS': 'mv_gateways'}, // for tiled WMS add ", 'TILED': true"
    serverType: 'geoserver',
    transition: 0,
  })
});

// 02 1 3 Potential Coverage as WFS
const potentialCoverageWFS = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url:'http://localhost:8080/geoserver/ows?service=wfs&' +
        'version=1.1.0&request=GetFeature&typename=melita:potential_coverage_test&' +
        'outputFormat=application/json&srsname=EPSG:3857&'
    }),
  style: potentialCoverageStyle
});
// 02 1 4 Potential Coverage as WMS
const potentialCoverageWMS = new TileLayer({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/melita/wms',
    params: {'LAYERS': 'melita:potential_coverage_test'}, // for tiled WMS add ", 'TILED': true"
    serverType: 'geoserver',
    transition: 0,
  })
});

// 02 2 Raster layers
// 02 2 1 active coverage


// put all on a map
new Map({
  target: 'map',
  layers: [
      cartoLightAll,
      //potentialCoverageWMS,
      potentialCoverageWFS,
      gatewayLocationsWFS
      //gatewayLocationsWMS
  ],
  view: new View({
    center: melitaWebMercator,
    zoom: 6,
  }),
});
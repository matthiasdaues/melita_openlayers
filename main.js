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

// layer types
import {Image as ImageLayer, Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';

// geoinformation and projections
import {createStringXY} from 'ol/coordinate';
import {fromLonLat} from 'ol/proj';

// styles
import {Circle, Fill, Stroke, Style} from 'ol/style';
import CircleStyle from 'ol/style/Circle';

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

// 02 define layers and content
// 02 1 vector layers
// 02 1 1 Gateway-Locations
const gatewayLocationsWFS = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
      return (
        'http://localhost:8080/geoserver/ows?service=wfs&' +
        'version=1.1.0&request=GetFeature&typename=melita:mv_gateways&' +
        'outputFormat=application/json&srsname=EPSG:3857&' +
        'bbox=' +
        extent.join(',') +
        ',EPSG:3857'
      )
    },
    strategy: bboxStrategy
  })
});
// 02 1 2 Gateway-Locations als WMS
const gatewayLocationsWMS = new TileLayer({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/melita/wms',
    params: {'LAYERS': 'mv_gateways'}, // for tiled WMS add ", 'TILED': true"
    serverType: 'geoserver',
    transition: 0,
  })
});

// put all on a map
new Map({
  target: 'map',
  layers: [
      cartoLightAll,
      //gatewayLocationsWFS,
      gatewayLocationsWMS
  ],
  view: new View({
    center: melitaWebMercator,
    zoom: 6,
  }),
});


  



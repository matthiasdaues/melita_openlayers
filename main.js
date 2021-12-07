// import required modules

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

// styles
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import { red } from 'nanocolors';
import { multiply } from 'ol/transform';

// interactions
import Select from 'ol/interaction/Select';

// overlays und popups
import PopupFeature from "ol-ext/overlay/PopupFeature";
import ol_legend_Item from 'ol-ext/legend/Item';


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
//    "0": locationStyleInactive,
    "1": locationStyleActive,
    "2": locationStyleActive
  };
  return styleTable[feature.get("status")]
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
// 02 1 4 Active Coverage as WFS
const activeCoverageWFS = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url:'http://localhost:8080/geoserver/ows?service=wfs&' +
        'version=1.1.0&request=GetFeature&typename=melita:active_coverage&' +
        'outputFormat=application/json&srsname=EPSG:3857&'
    }),
  style: activeCoverageStyle
});
// 02 1 5 active coverage as Vector Tile Layer
const activeCoverageMVT = new VectorTileLayer({
  className: 'activeCoverageMVT',
  source: new VectorTileSource({
    format: new MVT(),
    url: 
    'http://localhost:8080/geoserver/gwc/service/tms/1.0.0/melita%3Aactive_coverage@EPSG%3A3857@pbf/{z}/{x}/{-y}.pbf',
    maxZoom: 21,
  }),
  style: activeCoverageStyle,
});
// 02 1 6 potential coverage as Vector Tile Layer
const potentialCoverageMVT = new VectorTileLayer({
  className: 'potentialCoverageMVT',
  source: new VectorTileSource({
    format: new MVT(),
    url: 
    'http://localhost:8080/geoserver/gwc/service/tms/1.0.0/melita%3Apotential_coverage_test@EPSG%3A3857@pbf/{z}/{x}/{-y}.pbf',
    maxZoom: 21,
  }),
  style: potentialCoverageStyle, 
});
potentialCoverageMVT.setProperties({
  hello: "hello",
  world: "World!"
});




// put all on a map
var map = new Map({
  target: 'map',
  layers: [
      cartoLightAll,
      potentialCoverageMVT,
//      activeCoverageMVT,
//      gatewayLocationsWFS
  ],
  view: new View({
    center: melitaWebMercator,
    zoom: 6,
  }),
});




// add controls and tools
// add scaleline
var scaleline = new ScaleLine({});
map.addControl(scaleline);
// add zoom to extent
var zoom2extent = new ZoomToExtent({});
map.addControl(zoom2extent);
// add legend
var legend = new ol_legend_Legend({
  title: 'Coverage and Gateways',
  className: 'ol-legend',
  style: new Style({
    fill: new Fill({color: 'rgba(1,1,1,1)'})
  })
})
var legendCtrl = new ol_control_Legend({ 
  legend: legend,
  collapsed: false,
  collapsible: true
});
map.addControl(legendCtrl);
legend.addItem({ 
  title: 'center point', 
  feature: f0, 
  typeGeom: Circle,
    style: new Style({
    fill: new Fill({color: 'rgba(1,1,1,1)'})
  })
});
document.getElementByClass('ol-legend').style.backgroundColor = 'red';
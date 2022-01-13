// carto dark background map
const cartoDarkAll = new TileLayer({
    source: new XYZ({
      url:'http://{1-4}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
    })
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
    style: activeCoverageStyle, 
  });
  potentialCoverageMVT.setProperties({
    hello: "hello",
    world: "World!"
  });

  // 02 1 7 locations as Vector Tile Layer
const locationsMVT = new VectorTileLayer({
    className: 'indoorOutdoorCoverage',
    source: new VectorTileSource({
      format: new MVT(),
      url: 
      'http://localhost:8080/geoserver/gwc/service/tms/1.0.0/melita%3Amv_gateways@EPSG%3A3857@pbf/{z}/{x}/{-y}.pbf',
      maxZoom: 21,
    }),
    style: locationStyle, 
  });
// add controls and tools
// add scaleline
var scaleline = new ScaleLine({});
map.addControl(scaleline);
// add zoom to extent
var zoom2extent = new ZoomToExtent({});
map.addControl(zoom2extent);


// var legend = new ol_legend_Legend({
//   className: 'ol-test',
//   title: 'Coverage and Gateways',
//   style: new Style({
//   fill: new Fill({color: 'rgba(1,1,1,1)'})
//   })
// })
// var legendCtrl = new ol_control_Legend({ 
//   className: 'ol-test',
//   legend: legend,
//   collapsed: false,
//   collapsible: true
// });
// map.addControl(legendCtrl);
// legend.addItem({ 
//   title: 'center point', 
//   feature: f0, 
//   typeGeom: Circle,
//     style: new Style({
//     fill: new Fill({color: 'rgba(1,1,1,1)'})
//   })
// });
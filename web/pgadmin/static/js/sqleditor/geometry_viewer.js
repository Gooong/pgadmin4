import gettext from 'sources/gettext';
import Alertify from 'pgadmin.alertifyjs';
import {Geometry} from 'wkx';
import {Buffer} from 'buffer';
import $ from 'jquery';
import elementResizeDetectorMaker from 'element-resize-detector';

import L from 'leaflet';
import marker from 'leaflet/dist/images/marker-icon.png';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import layer from 'leaflet/dist/images/layers.png';
import layer2x from 'leaflet/dist/images/layers-2x.png';

// fix the icon url issue according to https://github.com/PaulLeCam/react-leaflet/issues/255
marker,marker2x,markerShadow,layer,layer2x;


let GeometryViewer = {
  'show_viewer':function (value) {
    Alertify.mapDialog || Alertify.dialog('mapDialog',function(){
      var $container = $('<div id="geometry-viewer-map" style="width: 100%; height: 100%"></div>');
      var erd = elementResizeDetectorMaker();
      var geometryLayer = L.geoJSON();
      var osmLayer = L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      });
      var mymap;

      return {
        main:function(data){
          let wkbBuffer = new Buffer(data, 'hex');
          let geometry = Geometry.parse(wkbBuffer);
          geometryLayer.clearLayers();
          //alert(JSON.stringify(geometry.toGeoJSON()));
          geometryLayer.addData(geometry.toGeoJSON());
          mymap.fitBounds(geometryLayer.getBounds());
        },
        setup:function(){
          return {
            options:{
              closable:true,
              title:gettext('Geometry Viewer'),
              frameless:true,
              padding :false,
              overflow:false,
            },
          };
        },
        build:function () {
          let div = $container.get(0);
          this.elements.content.appendChild(div);
          mymap = L.map(div).setView([0, 0], 1);
          // add resize event listener to resize map
          erd.listenTo(div, function() {
            setTimeout(function(){ mymap.invalidateSize();}, 100);
          });
          osmLayer.addTo(mymap);
          geometryLayer.addTo(mymap);
          Alertify.pgDialogBuild.apply(this);
        },
        prepare:function () {
          this.elements.dialog.style.width = '80%';
          this.elements.dialog.style.height = '60%';
        },
      };
    });
    Alertify.mapDialog(value);
  },

};


module.exports = GeometryViewer;

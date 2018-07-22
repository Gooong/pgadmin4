import gettext from 'sources/gettext';
import Alertify from 'pgadmin.alertifyjs';
import {Geometry} from 'wkx';
import {Buffer} from 'buffer';
import $ from 'jquery';
import L from 'leaflet';
import elementResizeDetectorMaker from 'element-resize-detector';

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
          geometryLayer.addData(geometry.toGeoJSON());
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

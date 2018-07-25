/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2018, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

import gettext from 'sources/gettext';
import Alertify from 'pgadmin.alertifyjs';
import {Geometry} from 'wkx';
import {Buffer} from 'buffer';
import $ from 'jquery';
import elementResizeDetectorMaker from 'element-resize-detector';
import L from 'leaflet';

// fix the icon url issue according to https://github.com/Leaflet/Leaflet/issues/4849
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/layers.png';
import 'leaflet/dist/images/layers-2x.png';


let GeometryViewerDialog = {

  'dialog': function (value) {

    Alertify.mapDialog || Alertify.dialog('mapDialog', function () {
      let $container = $('<div class="ewkb-viewer-container"></div>');
      let geomLayer = L.geoJSON();
      let osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a target="_blank" href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a>',
      });
      let lmap;

      return {
        main: function (geometry) {
          //reset map
          geomLayer.clearLayers();
          lmap.eachLayer(function (layer) {
            lmap.removeLayer(layer);
          });

          try {
            geomLayer.addData(geometry.toGeoJSON());
          } catch (e) {
            // Invalid LatLng object: (NaN, NaN)
            lmap.setView([0, 0], 0);
            return;
          }

          if (geometry.toWkt().endsWith('EMPTY')) {
            // empty geometry
            lmap.setView([0, 0], 0);
          } else {
            let bounds = geomLayer.getBounds();
            bounds = bounds.pad(0.1);
            let maxLength = Math.max(bounds.getNorth() - bounds.getSouth(),
              bounds.getEast() - bounds.getWest());
            if (geometry.srid === 4326) {
              lmap.options.crs = L.CRS.EPSG3857;
              lmap.setMinZoom(0);
              osmLayer.addTo(lmap);
            }
            else {
              lmap.options.crs = L.CRS.Simple;
              if (maxLength >= 180) {
                // calculate the min zoom level to enable the map to fit the whole geometry.
                let minZoom = Math.floor(Math.log2(360 / maxLength)) - 2;
                lmap.setMinZoom(minZoom);
              }
              else {
                lmap.setMinZoom(0);
              }
            }
            geomLayer.addTo(lmap);

            if (maxLength > 0) {
              lmap.fitBounds(bounds);
            }
            else {
              lmap.setView(bounds.getCenter(), 5);
            }
          }
        },

        setup: function () {
          return {
            options: {
              closable: true,
              frameless: true,
              padding: false,
              overflow: false,
              title: gettext('Geometry Viewer'),
            },
          };
        },

        build: function () {
          let div = $container.get(0);
          this.elements.content.appendChild(div);
          lmap = L.map(div);
          geomLayer.addTo(lmap);
          // add resize event listener to resize map
          let erd = elementResizeDetectorMaker();
          erd.listenTo(div, function () {
            setTimeout(function () {
              lmap.invalidateSize();
            }, 200);
          });
          Alertify.pgDialogBuild.apply(this);
          this.elements.dialog.style.width = '80%';
          this.elements.dialog.style.height = '60%';
        },

        prepare: function () {
          this.elements.dialog.style.width = '80%';
          this.elements.dialog.style.height = '60%';
        },
      };
    });

    let geometry;
    try {
      let buffer = new Buffer(value, 'hex');
      geometry = Geometry.parse(buffer);
    } catch (e) {
      Alertify.alert(gettext('Geometry Viewer Error'), gettext('Can not render geometry of this type'));
    }

    if (geometry.hasZ) {
      Alertify.alert(gettext('Geometry Viewer Error'), gettext('Can not render 3d geometry'));
    }
    else {
      Alertify.mapDialog(geometry);
    }
  },

};


module.exports = GeometryViewerDialog;

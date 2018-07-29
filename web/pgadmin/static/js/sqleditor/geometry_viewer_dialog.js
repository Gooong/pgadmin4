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
//import elementResizeDetectorMaker from 'element-resize-detector';
import L from 'leaflet';

// fix the icon url issue according to https://github.com/Leaflet/Leaflet/issues/4849
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/layers.png';
import 'leaflet/dist/images/layers-2x.png';


let GeometryViewerDialog = {
  'render_geometry': RenderGeometry,

  'render_all_geometries': RenderAllGeometries,

  'add_header_button': function (columnDefinition) {
    columnDefinition.header = {
      buttons: [
        {
          cssClass: 'div-view-geometry-column',
          tooltip: 'View all geometries in this column',
          showOnHover: false,
          command: 'view-all-geometries',
          content: '<button class="btn-xs btn-primary"><i class="fa fa-eye" aria-hidden="true"></i></button>',
        },
      ],
    };
  },
};


function RenderAllGeometries(e, args) {
  BuildGeometryViewerDialog();

  let items = args.grid.getData().getItems();
  let field = args.column.field;

  let geometries3D = [];
  let geometries = [];
  let unsupportedItems = [];
  _.each(items, function (item) {
    try {
      let value = item[field];
      let buffer = new Buffer(value, 'hex');
      let geometry = Geometry.parse(buffer);
      if (geometry.hasZ) {
        geometries3D.push(geometry);
      } else {
        if (!geometry.srid) {
          geometry.srid = 0;
        }
        geometries.push(geometry);
      }
    } catch (e) {
      unsupportedItems.push(item);
    }
  });

  // group geometries by SRID
  let geometriesGroupBySRID = _.groupBy(geometries, 'srid');
  let SRIDGeometriesPairs = _.pairs(geometriesGroupBySRID);
  let selectedPair = _.max(SRIDGeometriesPairs, function (pair) {
    return pair[1].length;
  });
  let srid = selectedPair[0];
  let geoJSONs = _.map(selectedPair[1], function (geometry) {
    return geometry.toGeoJSON();
  });

  Alertify.mapDialog(geoJSONs, parseInt(srid));
}

function RenderGeometry(dataView, columnDefinition, row) {
  BuildGeometryViewerDialog();

  let value = dataView.getItem(row)[columnDefinition.field];
  let geometry;
  try {
    let buffer = new Buffer(value, 'hex');
    geometry = Geometry.parse(buffer);
  } catch (e) {
    Alertify.alert(gettext('Geometry Viewer Error'), gettext('Can not render geometry of this type'));
  }

  if (geometry.hasZ) {
    Alertify.alert(gettext('Geometry Viewer Error'), gettext('Can not render 3d geometry'));
  } else {
    Alertify.mapDialog(geometry.toGeoJSON(), geometry.srid);
  }
}

function BuildGeometryViewerDialog() {
  Alertify.mapDialog || Alertify.dialog('mapDialog', function () {

    let divContainer;
    let vectorLayer;
    let osmLayer;
    let lmap;

    return {
      main: function (geojson, SRID) {
        //reset map
        vectorLayer.clearLayers();
        osmLayer.remove();
        divContainer.removeClass('ewkb-viewer-container-plain-background');

        try {
          vectorLayer.addData(geojson);
        } catch (e) {
          // Invalid LatLng object: (NaN, NaN)
          lmap.setView([0, 0], 0);
          return;
        }

        let bounds = vectorLayer.getBounds();
        if (!bounds.isValid()) {
          lmap.setView([0, 0], 0);
          return;
        }


        bounds = bounds.pad(0.1);
        let maxLength = Math.max(bounds.getNorth() - bounds.getSouth(),
          bounds.getEast() - bounds.getWest());
        if (SRID === 4326) {
          divContainer.addClass('ewkb-viewer-container-plain-background');
          lmap.options.crs = L.CRS.EPSG3857;
          lmap.setMinZoom(0);
          osmLayer.addTo(lmap);
        } else {
          lmap.options.crs = L.CRS.Simple;
          if (maxLength >= 180) {
            // calculate the min zoom level to enable the map to fit the whole geometry.
            let minZoom = Math.floor(Math.log2(360 / maxLength)) - 2;
            lmap.setMinZoom(minZoom);
          } else {
            lmap.setMinZoom(0);
          }
        }

        if (maxLength > 0) {
          lmap.fitBounds(bounds);
        } else {
          lmap.setView(bounds.getCenter(), 5);
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
        divContainer = $('<div class="ewkb-viewer-container"></div>');
        vectorLayer = L.geoJSON();
        osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '<a target="_blank" href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a>',
        });
        this.elements.content.appendChild(divContainer.get(0));
        lmap = L.map(divContainer.get(0),{
          preferCanvas: true,
        });
        vectorLayer.addTo(lmap);
        osmLayer.addTo(lmap);

        // // add resize event listener to resize map
        // let erd = elementResizeDetectorMaker();
        // erd.listenTo(divContainer, function () {
        //   setTimeout(function () {
        //     lmap.invalidateSize();
        //   }, 200);
        // });
        // Alertify.pgDialogBuild.apply(this);
        // this.elements.dialog.style.width = '80%';
        // this.elements.dialog.style.height = '60%';
      },

      // prepare: function () {
      //   this.elements.dialog.style.width = '80%';
      //   this.elements.dialog.style.height = '60%';
      // },
    };
  });
}

module.exports = GeometryViewerDialog;

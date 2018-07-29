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
import L from 'leaflet';

// fix the icon url issue according to https://github.com/Leaflet/Leaflet/issues/4849
// import 'leaflet/dist/images/marker-icon.png';
// import 'leaflet/dist/images/marker-icon-2x.png';
// import 'leaflet/dist/images/marker-shadow.png';
// import 'leaflet/dist/images/layers.png';
// import 'leaflet/dist/images/layers-2x.png';


let GeometryViewerDialog = {
  'render_geometry': RenderGeometry,

  'render_all_geometries': function (e, args) {
    let items = args.grid.getData().getItems();
    let columns = args.grid.getColumns();
    let columnIndex = columns.indexOf(args.column);
    RenderAllGeometries(items, columns, columnIndex);
  },

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

function RenderAllGeometries(items, columns, columnIndex) {
  BuildGeometryViewerDialog();
  const maxRenderByteLength = 5 * 1024 * 1024; //render geometry data up to 5MB
  let field = columns[columnIndex].field,
    geometries3D = [],
    geometries = [],
    unsupportedItems = [],
    geometryItemMap = new Map(),
    mixedSRID = false,
    geometryTotalByteLength = 0,
    tooLargeDataSize = false;


  _.every(items, function (item) {
    try {
      let value = item[field];
      let buffer = new Buffer(value, 'hex');
      let geometry = Geometry.parse(buffer);
      if (geometry.hasZ) {
        geometries3D.push(geometry);
      } else {
        geometryTotalByteLength += buffer.byteLength;
        if (geometryTotalByteLength > maxRenderByteLength) {
          tooLargeDataSize = true;
          return false;
        }
        if (!geometry.srid) {
          geometry.srid = 0;
        }
        geometries.push(geometry);
        geometryItemMap.set(geometry, item);
      }
    } catch (e) {
      unsupportedItems.push(item);
    }
    return true;
  });

  // group geometries by SRID
  let geometriesGroupBySRID = _.groupBy(geometries, 'srid');
  let SRIDGeometriesPairs = _.pairs(geometriesGroupBySRID);
  if (SRIDGeometriesPairs.length > 1) {
    mixedSRID = true;
  }
  let selectedPair = _.max(SRIDGeometriesPairs, function (pair) {
    return pair[1].length;
  });
  let selectedSRID = selectedPair[0];
  let selectedGeometries = selectedPair[1];
  let geoJSONs = _.map(selectedPair[1], function (geometry) {
    return geometry.toGeoJSON();
  });

  let getPopupContent = function (geojson) {
    let geometry = selectedGeometries[geoJSONs.indexOf(geojson)];
    //alert(JSON.stringify(geometryItemMap.has(geometry)));
    let item = geometryItemMap.get(geometry);
    return itemToTable(item, columns);
  };

  let infoContent = '';
  if (tooLargeDataSize) {
    infoContent += 'Too Large Data Size' +
      '<i className="fa fa-question-circle" title="Due to performance limitations, this viewer only render 5MB geometry" aria-hidden="true"></i>';
  }
  if (mixedSRID) {
    infoContent += 'Mixed SRID, Current SRID: ' + selectedSRID +
      '<i className="fa fa-question-circle" title="There are geometries with different SRIDs in this column" aria-hidden="true"></i>';
  }

  Alertify.mapDialog(geoJSONs, parseInt(selectedSRID), getPopupContent, infoContent);
}

function RenderGeometry(item, columns, columnIndex) {
  BuildGeometryViewerDialog();

  let value = item[columns[columnIndex].field];
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
    let geojson = geometry.toGeoJSON();
    let getPopupContent = function () {
      //alert(JSON.stringify(geojson == geojson));
      return itemToTable(item, columns);
    };
    Alertify.mapDialog(geojson, geometry.srid, getPopupContent);
  }
}

function BuildGeometryViewerDialog() {
  Alertify.mapDialog || Alertify.dialog('mapDialog', function () {

    let divContainer;
    let vectorLayer, osmLayer, lmap, popup, infoControl;
    let geojsonMarkerOptions = {
      radius: 4,
      weight: 2,
    };
    let geojsonStyle = {
      weight: 2,
    };

    return {
      main: function (geojson, SRID, getPopupContent, infoContent) {
        //reset map
        lmap.closePopup();
        infoControl.remove();
        vectorLayer.clearLayers();
        vectorLayer.off('click');
        osmLayer.remove();
        divContainer.removeClass('ewkb-viewer-container-plain-background');

        if (typeof getPopupContent === 'function') {
          vectorLayer.on('click', function (e) {
            let geometry;
            let feature = e.propagatedFrom.feature;
            if (feature.type === 'FeatureCollection') {
              geometry = feature;
            } else {
              geometry = feature.geometry;
            }
            popup.setLatLng(e.latlng);
            popup.setContent(getPopupContent(geometry));
            popup.openOn(lmap);
          });
        }

        if (!_.isUndefined(infoContent)) {
          alert(infoContent);
          infoControl.addTo(lmap);
          infoControl.update(infoContent);
        }

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
            closableByDimmer: true,
            maximizable: false,
            frameless: true,
            padding: false,
            overflow: false,
            title: gettext('Geometry Viewer'),
          },
        };
      },

      build: function () {
        divContainer = $('<div class="ewkb-viewer-container"></div>');
        this.elements.content.appendChild(divContainer.get(0));
        vectorLayer = L.geoJSON([], {
          style: geojsonStyle,
          pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
          },
        });
        osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '<a target="_blank" href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a>',
        });
        lmap = L.map(divContainer.get(0), {
          preferCanvas: true,
        });
        vectorLayer.addTo(lmap);
        osmLayer.addTo(lmap);
        popup = L.popup({
          closeButton: false,
          minWidth: 260,
          maxWidth: 400,
          maxHeight: 420,
        });
        infoControl = L.control({
          position: 'topright',
          initialize: function () {

          },
        });
        infoControl.onAdd = function () {
          this._div = L.DomUtil.create('div', 'geometry-viewer-info-control');
          return this._div;
        };
        infoControl.addTo(lmap);
        infoControl.update = function (content) {
          this._div.innerHTML = content;
        };


        Alertify.pgDialogBuild.apply(this);
        this.set('onresized', function () {
          setTimeout(function () {
            lmap.invalidateSize();
          }, 200);
        });
        this.elements.dialog.style.width = '80%';
        this.elements.dialog.style.height = '60%';
      },

      prepare: function () {
        this.elements.dialog.style.width = '80%';
        this.elements.dialog.style.height = '60%';
      },
    };
  });
}

function itemToTable(item, columns) {
  let content = '<table class="table table-bordered table-striped view-geometry-property-table"><tbody>';
  _.each(columns, function (columnDef) {
    if (!_.isUndefined(columnDef.display_name)) {
      content += '<tr><th>' + columnDef.display_name + '</th>' + '<td>';

      let value = item[columnDef.field];
      if (_.isUndefined(value) && columnDef.has_default_val) {
        content += '[default]';
      } else if (
        (_.isUndefined(value) && columnDef.not_null) ||
        (_.isUndefined(value) || value === null)
      ) {
        content += '[null]';
      } else {
        content += value;
      }
      content += '</td></tr>';
    }
  });
  content += '</tbody></table>';
  return content;
}

module.exports = GeometryViewerDialog;

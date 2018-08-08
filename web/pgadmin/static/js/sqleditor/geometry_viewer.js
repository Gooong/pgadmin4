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
import BuildGeometryViewerDialog from 'sources/sqleditor/geometry_viewer_dialog';

let GeometryViewer = {
  'render_geometry': renderGeometry,

  'add_header_button': function (columnDefinition) {
    if (columnDefinition.column_type_internal === 'geometry' ||
      columnDefinition.column_type_internal === 'geography') {
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
    }
  },
};

function renderGeometry(items, columns, columnIndex) {
  BuildGeometryViewerDialog();
  const maxRenderByteLength = 20 * 1024 * 1024; //render geometry data up to 20MB
  const maxRenderGeometries = 100000; // render geometries up to 100000
  let field = columns[columnIndex].field;
  let geometries3D = [],
    supportedGeometries = [],
    unsupportedItems = [],
    infoContent = [],
    geometryItemMap = new Map(),
    mixedSRID = false,
    geometryTotalByteLength = 0,
    tooLargeDataSize = false,
    tooManyGeometris = false;

  if (_.isUndefined(items)) {
    Alertify.alert(gettext('Geometry Viewer Error'), gettext('Empty data'));
    return;
  }

  if (!_.isArray(items)) {
    items = [items];
  }

  if (items.length === 0) {
    Alertify.alert(gettext('Geometry Viewer Error'), gettext('Empty Column'));
    return;
  }

  // parse ewkb data
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
        if (supportedGeometries.length >= maxRenderGeometries) {
          tooManyGeometris = true;
          return false;
        }

        if (!geometry.srid) {
          geometry.srid = 0;
        }
        supportedGeometries.push(geometry);
        geometryItemMap.set(geometry, item);
      }
    } catch (e) {
      unsupportedItems.push(item);
    }
    return true;
  });

  // generate map info content
  {
    if (tooLargeDataSize || tooManyGeometris) {
      infoContent.push(supportedGeometries.length + ' geometries rendered' +
        '<i class="fa fa-question-circle" title="Due to performance limitations, the extra geometries are not rendered" aria-hidden="true"></i>');
    }
    if (geometries3D.length > 0) {
      infoContent.push(gettext('3D geometries not rendered.'));
    }
    if (unsupportedItems.length > 0) {
      infoContent.push(gettext('Unsupported geometries not rendered.'));
    }
  }

  if (supportedGeometries.length === 0) {
    Alertify.mapDialog([], 0, undefined, infoContent);
    return;
  }

  // group geometries by SRID
  let geometriesGroupBySRID = _.groupBy(supportedGeometries, 'srid');
  let SRIDGeometriesPairs = _.pairs(geometriesGroupBySRID);
  if (SRIDGeometriesPairs.length > 1) {
    mixedSRID = true;
  }
  // select the largest group
  let selectedPair = _.max(SRIDGeometriesPairs, function (pair) {
    return pair[1].length;
  });
  let selectedSRID = selectedPair[0];
  let selectedGeometries = selectedPair[1];

  let geoJSONs = _.map(selectedGeometries, function (geometry) {
    return geometry.toGeoJSON();
  });

  let getPopupContent;
  if (columns.length >= 3) {
    // add popup when geometry has properties
    getPopupContent = function (geojson) {
      let geometry = selectedGeometries[geoJSONs.indexOf(geojson)];
      let item = geometryItemMap.get(geometry);
      return itemToTable(item, columns, columnIndex);
    };
  }

  if (mixedSRID) {
    infoContent.push(gettext('Geometries with non-SRID') + selectedSRID + ' not rendered.' +
      '<i class="fa fa-question-circle" title="There are geometries with different SRIDs in this column." aria-hidden="true"></i>');
  }

  Alertify.mapDialog(geoJSONs, parseInt(selectedSRID), getPopupContent, infoContent);
}

function itemToTable(item, columns, ignoredColumnIndex) {
  let content = '<table class="table table-bordered table-striped view-geometry-property-table"><tbody>';

  // start from 1 because columns[0] is empty
  for (let i = 1; i < columns.length; i++) {
    if (i !== ignoredColumnIndex) {
      let columnDef = columns[i];
      content += '<tr><th>' + columnDef.display_name + '</th>';

      let value = item[columnDef.field];
      if (_.isUndefined(value) && columnDef.has_default_val) {
        content += '<td class="td-disabled">[default]</td>';
      } else if ((_.isUndefined(value) && columnDef.not_null) ||
        (_.isUndefined(value) || value === null)) {
        content += '<td class="td-disabled">[null]</td>';
      } else {
        content += '<td>' + value + '</td>';
      }

      content += '</tr>';
    }
  }
  content += '</tbody></table>';
  return content;
}

module.exports = GeometryViewer;

/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2018, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

/* eslint-disable react/no-find-dom-node */

import React from 'react';
import SplitPane from 'react-split-pane';
import MapViewMap from './map_view_map';
import Geometry from 'wkx';
import Buffer from 'buffer';
import Shapes from '../react_shapes';
import _ from 'underscore';

const queryEntryListDivStyle = {
  overflowY: 'auto',
};


export default class MapView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectColumn:0,
      geometries: [],
      geoColumns: [],
    };
  }

  componentWillMount() {

    this.props.queryResult.onChange((columns, resultData) => {
      var _geoColumns =  _.filter(columns, function(column){
        return column.column_type === 'geometry' || column.column_type === 'geography';
      });

      if (_geoColumns.length >= 1){
        var first_index = columns.indexOf(_geoColumns[0]);
        if (first_index) {
          alert(columns);
          alert(first_index);
          var _geometries = _.map(resultData, function (row) {
            return this.parse_geometry(row[first_index]);
          });
          this.setState({
            geoColumns: _geoColumns,
            selectColumn: first_index,
            geometries: _geometries,
          });
        }
      }

    });

  }

  parse_geometry(geometry_hex) {
    var wkbBuffer = new Buffer(geometry_hex, 'hex');
    var geometry = Geometry.parse(wkbBuffer).toGeoJSON();
    return geometry;
  }

  render() {
    return (
      <SplitPane defaultSize='30%' split='vertical' pane1Style={queryEntryListDivStyle}>
        <SplitPane split='horizontal'>
          <div><p>Column Options</p></div>
          <div><p>Property Table</p></div>
        </SplitPane>
        <MapViewMap geometries = {this.state.geometries}/>
      </SplitPane>);
  }
}

MapView.propTypes = {
  queryResult: Shapes.queryResultClass.isRequired,
};

export {
  MapView,
};

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
import MapViewColumnOption from './map_view_column_option';
import {Geometry} from 'wkx';
import {Buffer} from 'buffer';
import Shapes from '../react_shapes';
import _ from 'underscore';


export default class MapView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      resultData:null,
      columns:null,
      geoColumns: [],

      selectedGeoColumnIndex:-1,
      selectedSRID:0,
      selectedGeometries: [],
    };
    this.selectGeoColumn = this.selectGeoColumn.bind(this);
  }

  componentWillMount() {

    this.props.queryResult.onChange((columns, resultData) => {
      let geoColumns =  _.filter(columns, function(column){
        return column.column_type === 'geography' || column.column_type === 'geometry';
      });
      this.setState({
        resultData:resultData,
        columns:columns,
        geoColumns:geoColumns,
      });

      if(geoColumns.length >= 1){
        this.selectGeoColumn(0);
      }
      else{
        this.selectGeoColumn(-1);
      }
    });
  }

  // parse EWKT data in selected column.
  selectGeoColumn(index){
    //alert('you select geocolumn:' + index);
    //alert(this.state.geoColumns.length);
    if (index !== this.state.selectedGeoColumnIndex){
      if (index >=0 && index < this.state.geoColumns.length){
        let columnName = this.state.geoColumns[index].name;
        //alert(columnIndex);
        //alert(JSON.stringify(this.state.resultData));
        let wkxGeometries = _.map(this.state.resultData, function (item) {
          let geometryHex = item[columnName];
          //alert(geometryHex);
          let wkbBuffer = new Buffer(geometryHex, 'hex');
          let geometry = Geometry.parse(wkbBuffer);
          if (typeof (geometry.srid) === 'undefined'){
            geometry.srid = 0;
          }
          return geometry;
        });

        // group geometries by SRID
        let geometriesGroupBySRID = _.groupBy(wkxGeometries, 'srid');
        let SRIDGeometriesPairs = _.pairs(geometriesGroupBySRID);
        let selectedPair = _.max(SRIDGeometriesPairs, function (pair) {
          return pair[1].length;
        });
        let geoJSONs = _.map(selectedPair[1], function (geometry) {
          return geometry.toGeoJSON();
        });
        this.setState({
          selectedGeoColumnIndex:index,
          selectedSRID:selectedPair[0],
          selectedGeometries:geoJSONs,
        });
      }
      else{
        this.setState({
          selectedGeoColumnIndex:-1,
          selectedSRID:4326,
          selectedGeometries:[],
        });
      }
    }

  }


  render() {
    return (
      <SplitPane defaultSize='30%' split='vertical'>
        <SplitPane defaultSize='50%' split='horizontal'>
          <MapViewColumnOption
            geoColumns = {this.state.geoColumns}
            selectedGeoColumnIndex = {this.state.selectedGeoColumnIndex}
            onSelectColumn = {this.selectGeoColumn}
          />

          <div><p>Property Table</p></div>
        </SplitPane>
        <MapViewMap
          geometries = {this.state.selectedGeometries}
          SRID = {this.state.selectedSRID}
        />
      </SplitPane>);
  }
}

MapView.propTypes = {
  queryResult: Shapes.queryResultClass.isRequired,
};

export {
  MapView,
};

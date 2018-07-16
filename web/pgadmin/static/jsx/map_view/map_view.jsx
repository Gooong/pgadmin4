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
//import MapViewPropertyTable from './map_view_property_table';

import {Geometry} from 'wkx';
import {Buffer} from 'buffer';
import Shapes from '../react_shapes';
//import ReactTable from 'react-table';
import _ from 'underscore';
var ol = require('ol/dist/ol.js');

export default class MapView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      resultData:null,
      columns:null,
      clientPrimaryKey:null,
      geoColumns: [],

      selectedGeoColumnIndex:-1,
      selectedSRID: 0,
      selectedGeometries: [],

      selectedItem: {},
    };
    this.selectGeoColumn = this.selectGeoColumn.bind(this);
    this.selectFeature = this.selectFeature.bind(this);
  }

  componentWillMount() {

    this.props.queryResult.onChange((columns, resultData, clientPrimaryKey) => {
      let geoColumns =  _.filter(columns, function(column){
        return column.column_type === 'geography' || column.column_type === 'geometry';
      });

      this.setState({
        resultData:resultData,
        columns:columns,
        clientPrimaryKey:clientPrimaryKey,
        geoColumns:geoColumns,
      });
      alert(this.state.clientPrimaryKey);

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
    if (index !== this.state.selectedGeoColumnIndex){
      if (index >=0 && index < this.state.geoColumns.length){
        let geometryItemDict = new Map();
        let columnName = this.state.geoColumns[index].name;
        let wkxGeometries = _.map(this.state.resultData, function (item) {
          let geometryHex = item[columnName];
          let wkbBuffer = new Buffer(geometryHex, 'hex');
          let geometry = Geometry.parse(wkbBuffer);
          if (typeof (geometry.srid) === 'undefined'){
            geometry.srid = '0';
          }
          geometryItemDict.set(geometry, item);
          return geometry;
        });

        // group geometries by SRID
        let geometriesGroupBySRID = _.groupBy(wkxGeometries, 'srid');
        let SRIDGeometriesPairs = _.pairs(geometriesGroupBySRID);
        let selectedPair = _.max(SRIDGeometriesPairs, function (pair) {
          return pair[1].length;
        });

        let format = new ol.format.GeoJSON();
        let featureItemDict = new Map();
        let features = _.map(selectedPair[1], function (geometry) {
          let geojson =  geometry.toGeoJSON();
          let feature = format.readFeature(geojson);
          featureItemDict.set(feature, geometryItemDict.get(geometry));
          return feature;
        });
        //alert(JSON.stringify(Object.keys(featureItemDict)));
        this.featureItemDict = featureItemDict;

        this.setState({
          selectedGeoColumnIndex:index,
          selectedSRID:selectedPair[0],
          selectedGeometries:features,
        });
      }
      else{
        this.setState({
          selectedGeoColumnIndex:-1,
          selectedSRID:'0',
          selectedGeometries:[],
        });
      }
    }

  }

  selectFeature(feature){
    //alert(JSON.stringify(this.featureItemDict[feature]));
    let propertyData = [];
    let item = this.featureItemDict.get(feature);
    for (var p in item){
      if (p !== this.state.clientPrimaryKey){
        propertyData.push({
          property: p,
          value: item[p],
        });
      }
    }
    this.setState({
      selectedItem: propertyData,
    });
  }


  render() {
    // let column = [
    //   {header:'Property', accessor:'property'},
    //   {header:'Value', accessor:'value'},
    // ];
    return (
      <SplitPane defaultSize='30%' split='vertical'>
        <SplitPane defaultSize='50%' split='horizontal'>
          <MapViewColumnOption
            geoColumns = {this.state.geoColumns}
            selectedGeoColumnIndex = {this.state.selectedGeoColumnIndex}
            onSelectColumn = {this.selectGeoColumn}
          />
          {/*<MapViewPropertyTable item={this.state.selectedItem}/>*/}
          <div>{JSON.stringify(this.state.selectedItem)}</div>
          {/*<ReactTable data = {this.state.selectedItem} columns={column}/>*/}
        </SplitPane>
        <MapViewMap
          geometries = {this.state.selectedGeometries}
          SRID = {this.state.selectedSRID}
          onSelectFeature = {this.selectFeature}
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

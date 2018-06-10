//////////////////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2018, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////////////////

import React from 'react';
import PropTypes from 'prop-types';

import Map from 'ol/map';
import Tile from 'ol/layer/tile';
import View from 'ol/view';
//import proj from 'ol/proj';
import OSM from 'ol/source/osm';
import GeoJSON from 'ol/format/geojson';
import Vector from 'ol/source/vector';
//import 'ol/ol.css';

export default class MapViewMap extends React.Component{
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    if (this.props.geometries.length >= 1){
      var vectorSource = new Vector({
        features: new GeoJSON().readFeatures(this.props.geometries),
      });
      new Map({
        target: 'olmap',
        layers: [
          new Tile({
            source: new OSM(),
          }),
          new Vector({
            source: vectorSource,
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      });
    }
  }

  render(){
    return(
      <div id='olmap'></div>
    );
  }
}

MapViewMap.propTypes = {
  geometries: PropTypes.array.isRequired,
};

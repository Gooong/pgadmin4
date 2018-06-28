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
import ReactResizeDetector from 'react-resize-detector';

//require('ol/ol.css');
var ol = require('ol/dist/ol');

// import Map from 'ol/Map.js';
// import View from 'ol/View.js';
// import Tile from 'ol/layer/Tile.js';
// // import XYZ from 'ol/source/XYZ.js';
// // // import Tile from 'ol/layer/Tile';
// //import proj from 'ol/proj';
// import OSM from 'ol/source/OSM';
// import GeoJSON from 'ol/format/GeoJSON';
// import Vector from 'ol/source/Vector';


export default class MapViewMap extends React.Component{
  constructor(props) {
    super(props);
    this.ol_map = new ol.Map({
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
      ],
      view: new ol.View({
        center: [0, 0],
        zoom: 2,
        projection: 'EPSG:4326',
      }),
    });
    this.onResize = this.onResize.bind(this);
  }

  componentDidMount(){
    this.ol_map.setTarget('ol-map');
  }

  componentDidUpdate(){
    alert(JSON.stringify(this.props.geometries[0]));
    const vectorSource = new ol.source.Vector({
      forrmat:new ol.format.GeoJSON(),
    });
    var format = new ol.format.GeoJSON();
    var features = _.map(this.props.geometries, function (geometry) {
      var geom = format.readFeature(geometry);
      return geom;
    });
    vectorSource.addFeatures(features);
    var new_layer = new ol.layer.Vector({
      source: vectorSource,
    });
    this.ol_map.addLayer(new_layer);
  }


  onResize() {
    var self = this;
    setTimeout( function() { self.ol_map.updateSize();}, 200);
  }

  render(){
    return(
      <div id='ol-map' className='ol-map'>
        <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
      </div>
    );
  }
}

MapViewMap.propTypes = {
  geometries: PropTypes.array.isRequired,
};

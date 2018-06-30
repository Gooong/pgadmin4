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

    this.backgroundLayer = new ol.layer.Tile({
      source: new ol.source.OSM(),
    });
    this.dataLayer = new ol.layer.Vector();
    this.mapView = new ol.View();
    this.olMap = new ol.Map({
      layers:[this.backgroundLayer, this.dataLayer],
      view: this.mapView,
    });

    this.onResize = this.onResize.bind(this);
  }

  componentDidMount(){
    this.olMap.setTarget('ol-map');
  }

  componentDidUpdate(){
    //alert(JSON.stringify(this.props.geometries[0]));


    //render new data in map
    const vectorSource = new ol.source.Vector({
      forrmat:new ol.format.GeoJSON(),
    });
    let format = new ol.format.GeoJSON();
    let features = _.map(this.props.geometries, function (geometry) {
      let geom = format.readFeature(geometry);
      return geom;
    });
    vectorSource.addFeatures(features);
    this.dataLayer.setSource(vectorSource);

    this.renderSRID = this.props.SRID===0? 4326:this.props.SRID;
    this.mapView = new ol.View({
      projection:'EPSG:' + this.renderSRID,
      center:[0,0],
      zoom:2,
    });

    this.olMap.setProperties({
      layers: [this.dataLayer, this.backgroundLayer],
      view: this.mapView,
    });
  }


  onResize() {
    let self = this;
    setTimeout( function() { self.olMap.updateSize();}, 100);
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
  SRID: PropTypes.number.isRequired,
};

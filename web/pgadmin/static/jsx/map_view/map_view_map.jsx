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
var ol = require('ol/dist/ol.js');

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
    this.initMap();
    this.onResize = this.onResize.bind(this);
  }

  initMap(){
    this.backgroundLayer = new ol.layer.Tile({
      source: new ol.source.OSM(),
    });
    this.dataLayer = new ol.layer.Vector({
      renderMode: 'image',
    });
    this.mapView = new ol.View();
    let selectClick = new ol.interaction.Select({
      condition:  ol.events.condition.click,
    });
    this.olMap = new ol.Map({
      layers:[this.backgroundLayer, this.dataLayer],
      view: this.mapView,
    });
    this.olMap.addInteraction(selectClick);
  }

  componentDidMount(){
    this.olMap.setTarget('ol-map');
  }

  componentDidUpdate(){

    let vectorSource = new ol.source.Vector();
    let format = new ol.format.GeoJSON();
    let projection = new ol.proj.Projection({
      code: 'EPSG:' + this.props.SRID,
      units: 'm',
    });

    let features = _.map(this.props.geometries, function (geometry) {
      return format.readFeature(geometry, {
        dataProjection: projection,
        featureProjection: projection,
      });
    });
    vectorSource.addFeatures(features);

    if (features.length > 0){
      this.dataLayer.setSource(vectorSource);

      alert(this.props.SRID);
      alert(features.length);
      alert(vectorSource.getExtent());
      if(this.renderSRID !== this.props.SRID){
        this.renderSRID = this.props.SRID;
        this.mapView = new ol.View({
          projection: projection,
          center:[0,0],
        });
      }
      this.olMap.setProperties({
        layers: [this.dataLayer, this.backgroundLayer ],
        view: this.mapView,
      });
      this.mapView.fit(vectorSource.getExtent(),{duration:500, constrainResolution: false});
    }
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

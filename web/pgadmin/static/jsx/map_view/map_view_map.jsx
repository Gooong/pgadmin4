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
    this.dataLayer = new ol.layer.Vector();
    this.mapView = new ol.View();
    this.olMap = new ol.Map({
      layers:[this.backgroundLayer, this.dataLayer],
      view: this.mapView,
    });

    let selectClick = new ol.interaction.Select({
      condition:  ol.events.condition.click,
    });
    let onSelectFeature = this.props.onSelectFeature;
    selectClick.on('select', function (e) {
      if (e.selected.length > 0){
        onSelectFeature(e.selected[0]);
      }
    });
    this.olMap.addInteraction(selectClick);
  }

  componentDidMount(){
    this.olMap.setTarget('ol-map');
  }

  componentDidUpdate() {
    if (this.props.geometries.length > 0) {
      // this.selectClick.un('select');
      // let key = this.props.clientPrimaryKey;
      // this.selectClick.on('select', function (e) {
      //   let selectedFeature = e.selected[0];
      //   alert(selectedFeature.get(key));
      // });

      let vectorSource = new ol.source.Vector();
      vectorSource.addFeatures(this.props.geometries);
      this.dataLayer.setProperties({
        renderMode:'image',
        source:vectorSource,
      });
      let dataExtent = vectorSource.getExtent();

      let projection;
      let layers;
      if (this.props.SRID === '4326' || this.props.SRID === '3857'){
        projection = ol.proj.get('EPSG:' + this.props.SRID);
        layers = [this.dataLayer, this.backgroundLayer];
      }
      else{
        projection = new ol.proj.Projection({
          code: 'EPSG:' + this.props.SRID,
          extent: dataExtent,
        });
        layers = [this.dataLayer];
      }

      if (this.renderSRID !== this.props.SRID) {
        this.renderSRID = this.props.SRID;
        this.mapView = new ol.View({
          projection: projection,
          center: ol.extent.getCenter(dataExtent),
          minZoom:1,
          zoom: 2,
        });
      }
      this.olMap.setProperties({
        layers: layers,
        view: this.mapView,
      });
      //this.mapView.fit(vectorSource.getExtent(), {duration: 500, constrainResolution: false});
    }
    else {
      this.olMap.setProperties({
        layers:[],
      });
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
  onSelectFeature: PropTypes.func.isRequired,
};

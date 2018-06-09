//////////////////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2018, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////////////////

import React from 'react';
//import ol from 'ol';

import Map from 'ol/map';
import Tile from 'ol/layer/tile';
import View from 'ol/view';
//import proj from 'ol/proj';
import OSM from 'ol/source/osm';
//import 'ol/ol.css';

export default class MapViewMap extends React.Component{
  constructor(props) {
    super(props);

    this.state = {
      collecction:[],
      columns:[],
      selected_rows: [],
    };

  }

  componentDidMount(){
    let olmap = new Map({
      target: 'openlayers_map',
      layers: [
        new Tile({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
    olmap.render();
  }

  render(){
    return(
      <div id='openlayers_map'></div>
    );
  }
}


MapViewMap.propTypes = {

};

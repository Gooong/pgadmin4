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


const queryEntryListDivStyle = {
  overflowY: 'auto',
};


export default class MapView extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      collecction:[],
      columns:[],
      selected_rows: [],
    };

  }

  parse_geometry(geometry_hex) {
    var wkbBuffer = new Buffer(geometry_hex, 'hex');
    var geometry = Geometry.parse(wkbBuffer);
    return geometry;
  }


  render() {
    return (
      <SplitPane defaultSize='30%' split='vertical' pane1Style={queryEntryListDivStyle}>
        <SplitPane split='horizontal'>
          <div><p>Column Options</p></div>
          <div><p>Property Table</p></div>
        </SplitPane>
        <MapViewMap/>
      </SplitPane>);
  }
}

MapView.propTypes = {

};

export {
  MapView,
};

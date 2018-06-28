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
import MapViewColumnInfo from 'map_view_column_info';

export default class MapViewColumnOption extends React.Component{
  constructor(props) {
    super(props);
  }

  render(){
    return(
      <div id='map_view_column_option'>
        {this.props.geoColumns.map((column_info) =>
          <MapViewColumnInfo columnInfo={column_info} />
        )}
      </div>
    );
  }
}

MapViewColumnOption.propTypes = {
  geoColumns: PropTypes.array.isRequired,
};

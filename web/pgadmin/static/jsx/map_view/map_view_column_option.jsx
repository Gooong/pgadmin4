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

  retrieveGroup(){
    return (this.props.geoColumns.map((columnInfo, index) =>
      <li key={index}
        className='list-item'
        tabIndex={0}
        onClick={() => this.props.onSelectColumn(index)}>

        <MapViewColumnInfo
          columnInfo={columnInfo}
          isSelected={index === this.props.selectedGeoColumnIndex}
        />
      </li>
    ));
  }

  render(){
    return (
      <div id='geo_columns' className="geo-columns">
        <ul>
          {this.retrieveGroup()}
        </ul>
      </div>);

  }
}

MapViewColumnOption.propTypes = {
  geoColumns: PropTypes.array.isRequired,
  selectedGeoColumnIndex: PropTypes.number.isRequired,
  onSelectColumn: PropTypes.func.isRequired,
};

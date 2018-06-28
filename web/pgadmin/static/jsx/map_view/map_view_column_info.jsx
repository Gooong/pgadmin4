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


export default class MapViewColumnInfo extends React.Component{
  constructor(props) {
    super(props);
  }

  render(){
    return(
      <div>{this.props.columnInfo.display_name}</div>
    );
  }
}

MapViewColumnInfo.propTypes = {
  columnInfo: PropTypes.object.isRequired,
};

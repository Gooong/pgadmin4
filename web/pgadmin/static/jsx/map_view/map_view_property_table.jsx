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

export default class MapViewPropertyTable extends React.Component{


  render(){
    return(
      <div>{JSON.stringify(this.props.item)}</div>
    );
  }
}

MapViewPropertyTable.propTypes = {
  item: PropTypes.object.isRequired,
};

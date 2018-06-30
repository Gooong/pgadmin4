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

  // col = {
  // 'name': c.name,
  // 'display_name': c.display_name,
  // 'column_type': col_type,
  // 'column_type_internal': type,
  // 'pos': c.pos,
  // 'label': column_label,
  // 'cell': col_cell,
  // 'can_edit': (c.name == 'oid') ? false : self.can_edit,
  // 'type': type,
  // 'not_null': c.not_null,
  // 'has_default_val': c.has_default_val,
  // 'is_array': array_type_bracket_index > -1 && array_type_bracket_index + 2 == type.length,
  // };
  //
  render(){
    return(
      <div className={'column-info' + (this.props.isSelected?' selected':'')}>
        <div className='column-name'>
          {'column name: ' + this.props.columnInfo.name}
        </div>
        <div className='other-info'>
          <div className='column-type'>
            {'column type: ' + this.props.columnInfo.type}
          </div>

        </div>
      </div>
    );
  }
}

MapViewColumnInfo.propTypes = {
  columnInfo: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

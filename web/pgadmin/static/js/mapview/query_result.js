/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2018, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

export default class QueryResult {

  constructor(columns, result_data, client_primary_key) {
    this.columns = columns;
    this.resultData = result_data;
    this.clientPrimaryKey = client_primary_key;
    this.onChange(() => {});
  }

  update(columns, resultData, client_primary_key){
    this.columns = columns;
    this.resultData = resultData;
    this.clientPrimaryKey = client_primary_key;
    this.onChangeHandler(this.columns, this.resultData, this.clientPrimaryKey);
  }

  onChange(onChangeHandler) {
    this.onChangeHandler = onChangeHandler;
  }

}

/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2018, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

export default class QueryResult {

  constructor(columns, result_data) {
    this.columns = columns;
    this.resultData = result_data;
    this.onChange(() => {});
  }

  reset() {
    this.columns = [];
    this.resultData = [];
    this.onResetHandler(this.columns, this.resultData);
  }

  update(columns, resultData){
    this.columns = columns;
    this.resultData = resultData;
    this.onChangeHandler(this.columns, this.resultData);
  }

  onChange(onChangeHandler) {
    this.onChangeHandler = onChangeHandler;
  }

  onReset(onResetHandler) {
    this.onResetHandler = onResetHandler;
  }
}

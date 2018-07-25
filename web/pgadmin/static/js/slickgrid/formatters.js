/***
 * Contains pgAdmin4 related SlickGrid formatters.
 *
 * @module Formatters
 * @namespace Slick
 */
import {Geometry} from 'wkx';
import {Buffer} from 'buffer';

(function($) {
  // register namespace
  $.extend(true, window, {
    'Slick': {
      'Formatters': {
        'JsonString': JsonFormatter,
        'Numbers': NumbersFormatter,
        'Checkmark': CheckmarkFormatter,
        'Text': TextFormatter,
        'Binary': BinaryFormatter,
        'EWKB': EWKBFormatter,
      },
    },
  });

  function NullAndDefaultFormatter(row, cell, value, columnDef) {
    if (_.isUndefined(value) && columnDef.has_default_val) {
      return '<span class=\'pull-left disabled_cell\'>[default]</span>';
    } else if (
      (_.isUndefined(value) && columnDef.not_null) ||
      (_.isUndefined(value) || value === null)
    ) {
      return '<span class=\'pull-left disabled_cell\'>[null]</span>';
    }
    return null;
  }

  function NullAndDefaultNumberFormatter(row, cell, value, columnDef) {
    if (_.isUndefined(value) && columnDef.has_default_val) {
      return '<span class=\'pull-right disabled_cell\'>[default]</span>';
    } else if (
      (_.isUndefined(value) && columnDef.not_null) ||
      (_.isUndefined(value) || value === null)
    ) {
      return '<span class=\'pull-right disabled_cell\'>[null]</span>';
    }
    return null;
  }

  function JsonFormatter(row, cell, value, columnDef, dataContext) {
    // If column has default value, set placeholder
    var data = NullAndDefaultFormatter(row, cell, value, columnDef, dataContext);
    if (data) {
      return data;
    } else {
      // Stringify only if it's json object
      if (typeof value === 'object' && !Array.isArray(value)) {
        return _.escape(JSON.stringify(value));
      } else if (Array.isArray(value)) {
        var temp = [];
        $.each(value, function(i, val) {
          if (typeof val === 'object') {
            temp.push(JSON.stringify(val));
          } else {
            temp.push(val);
          }
        });
        return _.escape('[' + temp.join() + ']');
      } else {
        return _.escape(value);
      }
    }
  }

  function NumbersFormatter(row, cell, value, columnDef, dataContext) {
    // If column has default value, set placeholder
    var data = NullAndDefaultNumberFormatter(row, cell, value, columnDef, dataContext);
    if (data) {
      return data;
    } else {
      return '<span style=\'float:right\'>' + _.escape(value) + '</span>';
    }
  }

  function CheckmarkFormatter(row, cell, value, columnDef, dataContext) {
    /* Checkbox has 3 states
     * 1) checked=true
     * 2) unchecked=false
     * 3) indeterminate=null
     */
    var data = NullAndDefaultFormatter(row, cell, value, columnDef, dataContext);
    if (data) {
      return data;
    } else {
      return value ? 'true' : 'false';
    }
  }

  function TextFormatter(row, cell, value, columnDef, dataContext) {
    // If column has default value, set placeholder
    var data = NullAndDefaultFormatter(row, cell, value, columnDef, dataContext);
    if (data) {
      return data;
    } else {
      return _.escape(value);
    }
  }

  function BinaryFormatter(row, cell, value, columnDef, dataContext) {
    // If column has default value, set placeholder
    var data = NullAndDefaultFormatter(row, cell, value, columnDef, dataContext);
    if (data) {
      return data;
    } else {
      return '<span class=\'pull-left disabled_cell\'>[' + _.escape(value) + ']</span>';
    }
  }

  function EWKBFormatter(row, cell, value, columnDef, dataContext) {
    // If column has default value, set placeholder
    var data = NullAndDefaultFormatter(row, cell, value, columnDef, dataContext);
    if (data) {
      return data;
    } else {
      let geometry;
      try {
        let buffer = new Buffer(value, 'hex');
        geometry = Geometry.parse(buffer);
      } catch (e) {
        //unsupported geometry type
        return '<button title="Can not render geometry of this type" class="btn-xs btn-default btn-ewkb-viewer disabled">' +
          '<i class="fa fa-eye-slash" aria-hidden="true"></i>' +
          '</button>' +
          _.escape(value);
      }

      if (geometry.hasZ) {
        //the viewer can not render 3d geometry
        return '<button title="Can not render 3d geometry" class="btn-xs btn-default btn-ewkb-viewer disabled">' +
          '<i class="fa fa-eye-slash" aria-hidden="true"></i>' +
          '</button>' +
          _.escape(value);
      }
      else {
        return '<button title="View Geometry" class="btn-xs btn-default btn-ewkb-viewer btn-view-ewkb-enabled">' +
          '<i class="fa fa-eye" aria-hidden="true"></i>' +
          '</button>' +
          _.escape(value);
      }

    }
  }
})(window.jQuery);

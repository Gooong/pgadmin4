/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2018, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

import Alertify from 'pgadmin.alertifyjs';
import L from 'leaflet';
import gettext from 'sources/gettext';
import $ from 'jquery';

function BuildGeometryViewerDialog() {
  Alertify.mapDialog || Alertify.dialog('mapDialog', function () {

    let divContainer;
    let vectorLayer, osmLayer, lmap, infoControl;
    const geojsonMarkerOptions = {
      radius: 4,
      weight: 2,
    };
    const geojsonStyle = {
      weight: 2,
    };
    const popupOption = {
      closeButton: false,
      minWidth: 260,
      maxWidth: 400,
      maxHeight: 420,
    };

    return {
      main: function (geojson, SRID, getPopupContent, infoContent = []) {
        //reset map
        osmLayer.remove();

        if (infoContent.length > 0) {
          let content = infoContent.join('<br/>');
          infoControl.addTo(lmap);
          infoControl.update(content);
        }

        try {
          vectorLayer.addData(geojson);
        } catch (e) {
          // Invalid LatLng object: (NaN, NaN)
          lmap.setView([0, 0], 0);
          return;
        }

        if (typeof getPopupContent === 'function') {
          vectorLayer.eachLayer(function (layer) {
            layer.bindPopup(function () {
              return getPopupContent(layer.feature.geometry);
            }, popupOption);
          });
        }

        let bounds = vectorLayer.getBounds();
        if (!bounds.isValid()) {
          lmap.setView([0, 0], 0);
          return;
        }

        bounds = bounds.pad(0.1);
        let maxLength = Math.max(bounds.getNorth() - bounds.getSouth(),
          bounds.getEast() - bounds.getWest());
        if (SRID === 4326) {
          divContainer.addClass('ewkb-viewer-container-plain-background');
          lmap.options.crs = L.CRS.EPSG3857;
          lmap.setMinZoom(0);
          osmLayer.addTo(lmap);
        } else {
          lmap.options.crs = L.CRS.Simple;
          if (maxLength >= 180) {
            // calculate the min zoom level to enable the map to fit the whole geometry.
            let minZoom = Math.floor(Math.log2(360 / maxLength)) - 2;
            lmap.setMinZoom(minZoom);
          } else {
            lmap.setMinZoom(0);
          }
        }

        if (maxLength > 0) {
          lmap.fitBounds(bounds);
        } else {
          lmap.setView(bounds.getCenter(), 5);
        }
      },

      setup: function () {
        return {
          options: {
            closable: true,
            closableByDimmer: true,
            maximizable: false,
            frameless: true,
            padding: false,
            overflow: false,
            title: gettext('Geometry Viewer'),
          },
        };
      },

      build: function () {
        divContainer = $('<div class="ewkb-viewer-container"></div>');
        this.elements.content.appendChild(divContainer.get(0));
        vectorLayer = L.geoJSON([], {
          style: geojsonStyle,
          pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
          },
        });
        osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '<a target="_blank" href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a>',
        });
        lmap = L.map(divContainer.get(0), {
          preferCanvas: true,
        });
        vectorLayer.addTo(lmap);
        osmLayer.addTo(lmap);
        infoControl = L.control({
          position: 'topright',
          initialize: function () {

          },
        });
        infoControl.onAdd = function () {
          this._div = L.DomUtil.create('div', 'geometry-viewer-info-control');
          return this._div;
        };
        infoControl.update = function (content) {
          this._div.innerHTML = content;
        };


        Alertify.pgDialogBuild.apply(this);
        this.set('onresized', function () {
          setTimeout(function () {
            lmap.invalidateSize();
          }, 50);
        });
        this.elements.dialog.style.width = '80%';
        this.elements.dialog.style.height = '60%';
      },

      prepare: function () {
        this.elements.dialog.style.width = '80%';
        this.elements.dialog.style.height = '60%';
      },

      hooks: {
        onshow: function () {
          lmap.invalidateSize();
        },

        onclose: function () {
          //reset map
          lmap.closePopup();
          infoControl.remove();
          vectorLayer.clearLayers();
          vectorLayer.off('click');
          divContainer.removeClass('ewkb-viewer-container-plain-background');
        }
        ,
      },
    };
  });
}

module.exports = BuildGeometryViewerDialog;

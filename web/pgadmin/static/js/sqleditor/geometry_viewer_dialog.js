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
import 'leaflet-providers/leaflet-providers';

function BuildGeometryViewerDialog() {
  if (!Alertify.mapDialog) {
    Alertify.dialog('mapDialog', function () {

      let divContainer;
      let vectorLayer,
        //osmLayer,
        baseLayers,
        lmap,
        infoControl,
        layerControl;

      const geojsonMarkerOptions = {
        radius: 4,
        weight: 3,
      };
      const geojsonStyle = {
        weight: 2,
      };
      const popupOption = {
        closeButton: false,
        minWidth: 260,
        maxWidth: 300,
        maxHeight: 320,
      };

      return {
        main: function (geoJSONs, SRID, getPopupContent, infoContent = []) {

          if (infoContent.length > 0) {
            let content = infoContent.join('<br/>');
            infoControl.addTo(lmap);
            infoControl.update(content);
          }

          if (geoJSONs.length === 0) {
            lmap.setView([0, 0], 0);
            return;
          }

          try {
            vectorLayer.addData(geoJSONs);
          } catch (e) {
            // Invalid LatLng object: (NaN, NaN)
            lmap.setView([0, 0], 0);
            return;
          }

          let bounds = vectorLayer.getBounds();
          if (!bounds.isValid()) {
            lmap.setView([0, 0], 0);
            return;
          }

          if (typeof getPopupContent === 'function') {
            let addPopup = function (layer) {
              layer.bindPopup(function () {
                return getPopupContent(layer.feature.geometry);
              }, popupOption);
            };
            vectorLayer.eachLayer(addPopup);
          }

          bounds = bounds.pad(0.1);
          let maxLength = Math.max(bounds.getNorth() - bounds.getSouth(),
            bounds.getEast() - bounds.getWest());
          if (SRID === 4326) {
            divContainer.addClass('ewkb-viewer-container-plain-background');
            lmap.options.crs = L.CRS.EPSG3857;
            lmap.setMinZoom(0);
            layerControl.addTo(lmap);
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
          //hide close button
          this.elements.commands.close.style = 'visibility:hidden';

          divContainer = $('<div class="ewkb-viewer-container"></div>');
          this.elements.content.appendChild(divContainer.get(0));
          lmap = L.map(divContainer.get(0), {
            preferCanvas: true,
          });
          vectorLayer = L.geoJSON([], {
            style: geojsonStyle,
            pointToLayer: function (feature, latlng) {
              return L.circleMarker(latlng, geojsonMarkerOptions);
            },
          });
          vectorLayer.addTo(lmap);

          baseLayers = {
            'Empty': L.tileLayer(''),
            'Street': L.tileLayer.provider('OpenStreetMap.Mapnik'),
            'Topography': L.tileLayer.provider('OpenTopoMap'),
            'Gray Style': L.tileLayer.provider('CartoDB.Positron'),
            'Light Color': L.tileLayer.provider('CartoDB.Voyager'),
            'Dark Matter': L.tileLayer.provider('CartoDB.DarkMatter'),
          };
          layerControl = L.control.layers(baseLayers);
          // add OpenStreetMap layer by default
          baseLayers.Street.addTo(lmap);

          infoControl = L.control({
            position: 'topright',
          });
          infoControl.onAdd = function () {
            this._div = L.DomUtil.create('div', 'geometry-viewer-info-control');
            return this._div;
          };
          infoControl.update = function (content) {
            this._div.innerHTML = content;
          };

          //Alertify.pgDialogBuild.apply(this);
          this.set('onresized', function () {
            setTimeout(function () {
              lmap.invalidateSize();
            }, 50);
          });

          this.elements.dialog.style.maxWidth = 'unset';
          this.elements.dialog.style.minWidth = 'unset';
          this.elements.dialog.style.maxHeight = 'unset';
          this.elements.dialog.style.minHeight = 'unset';
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
            divContainer.removeClass('ewkb-viewer-container-plain-background');
            layerControl.remove();
          },
        },
      };
    });
  }
}

module.exports = BuildGeometryViewerDialog;

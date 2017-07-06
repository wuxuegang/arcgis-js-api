// COPYRIGHT © 2017 Esri
//
// All rights reserved under the copyright laws of the United States
// and applicable international laws, treaties, and conventions.
//
// This material is licensed for use under the Esri Master License
// Agreement (MLA), and is bound by the terms of that agreement.
// You may redistribute and use this code without modification,
// provided you adhere to the terms of the MLA and include this
// copyright notice.
//
// See use restrictions at http://www.esri.com/legal/pdfs/mla_e204_e300/english
//
// For additional information, contact:
// Environmental Systems Research Institute, Inc.
// Attn: Contracts and Legal Services Department
// 380 New York Street
// Redlands, California, USA 92373
// USA
//
// email: contracts@esri.com
//
// See http://js.arcgis.com/3.21/esri/copyright.txt for details.

define(["dojo/_base/declare","dojo/_base/connect","dojo/_base/lang","dojo/_base/array","dojo/has","../kernel","../geometry/Point","../tasks/query","./RenderMode","./GridLayout"],function(e,t,i,r,s,a,n,o,u,l){var h=e([u],{declaredClass:"esri.layers._OnDemandMode",constructor:function(e){this.featureLayer=e,this._featureMap={},this._hasPartialFeatures=!1,this._queryErrorHandler=i.hitch(this,this._queryErrorHandler)},initialize:function(e){this.inherited(arguments);var t=this.featureLayer,i=t._srInfo;this._gridLayer=new l(new n(i?i.valid[0]:e.extent.xmin,i?i.valid[1]:e.extent.ymax,e.spatialReference),{width:t._tileWidth,height:t._tileHeight},{width:e.width,height:e.height},i),this._cellMap={},this._gridLayer.setResolution(e.extent)},startup:function(){this._ioQueue=[],this.featureLayer.suspended||(this._zoomHandler(),this._enableConnectors())},propertyChangeHandler:function(e){this._init&&(2>e?this._zoomHandler():console.log("FeatureLayer: layer in on-demand mode does not support time definitions. Layer id = "+this.featureLayer.id+", Layer URL = "+this.featureLayer.url))},destroy:function(){this._disableConnectors(),this.inherited(arguments)},drawFeature:function(e){var t=this._gridLayer,i=e.geometry,r=[];if(i){r=t.getCellsInExtent("point"===i.type?{xmin:i.x,ymin:i.y,xmax:i.x,ymax:i.y}:i.getExtent(),!1).cells;var s,a,n,o,u,l=this._cellMap,h=e.attributes[this.featureLayer.objectIdField];for(s=0;s<r.length;s++)a=r[s],n=a.latticeID,o=a.row,u=a.col,n?a=l[n]=l[n]||a:(l[o]=l[o]||{},a=l[o][u]=l[o][u]||a),a.features=a.features||[],a.features.push(e),this._addFeatureIIf(h,e),this._incRefCount(h)}},suspend:function(){this._init&&this._disableConnectors()},resume:function(){this._init&&(this._enableConnectors(),this._zoomHandler())},refresh:function(){this._zoomHandler()},hasAllFeatures:function(){if(this._hasPartialFeatures)return!0;var e,t=!1,i=this._getCurrentCells();for(e=0;e<i.length;e++)if(i[e].hasPartialFeatures){t=!0;break}return!t},_enableConnectors:function(){var e=this.map;this._zoomConnect=t.connect(e,"onZoomEnd",this,this._zoomHandler),this._panConnect=t.connect(e,"onPanEnd",this,this._panHandler),this._resizeConnect=t.connect(e,"onResize",this,this._panHandler)},_disableConnectors:function(){t.disconnect(this._zoomConnect),t.disconnect(this._panConnect),t.disconnect(this._resizeConnect)},_zoomHandler:function(){this._processIOQueue(!0);var e=this.featureLayer,t=this.map;if(!e.suspended&&e.isQueryable()){e._fireUpdateStart(),this._clearIIf(),this._hasPartialFeatures=!1;var i=e._trackManager;i&&i.clearTracks(),this._cellMap={},this._gridLayer.setResolution(t.extent),this._sendRequest()}},_panHandler:function(){if(this.featureLayer.isQueryable()){this.featureLayer._fireUpdateStart();var e=this.featureLayer._resized,t=e?arguments[0]:null;e&&this._gridLayer.setMapState(t,this.map.width,this.map.height),this._sendRequest(t)}},_getRequestId:function(e,t){var i="_"+e.name+e.layerId+e._ulid+"_"+t.resolution+"_"+(t.latticeID||t.row+"_"+t.col);return i.replace(/[^a-zA-Z0-9\_]+/g,"_")},_sendRequest:function(e){this._exceeds=!1;var t=this.featureLayer,i=this.map,s=e||i.extent,a=this._gridLayer.getCellsInExtent(s,t.latticeTiling),n=a.cells;if(!t.isEditable()){var u=this._cellMap;n=r.filter(n,function(e){if(e.lattice){if(u[e.latticeID])return!1}else if(u[e.row]&&u[e.row][e.col])return!1;return!0})}var l,h,d,_,c=t.getOutFields(),f=t.getDefinitionExpression(),p=t._getOffsettedTE(t._mapTimeExtent),y=t.supportsAdvancedQueries?t.getOrderByFields():null,g=t._usePatch,m=this._ioQueue,v=this,C=this._drawFeatures;for(this._pending=this._pending||0,l=0;l<n.length;l++){h=n[l],d=new o,d.geometry=h.extent||h.lattice,d.outFields=c,d.where=f,t.latticeTiling&&h.extent&&(d.spatialRelationship=o.SPATIAL_REL_CONTAINS),d.returnGeometry=!0,d.timeExtent=p,t._ts&&(d._ts=(new Date).getTime()),d.orderByFields=y,d.multipatchOption=t.multipatchOption,d.maxAllowableOffset=t._maxOffset,d.quantizationParameters=t._quantizationParameters;var L=t.advancedQueryCapabilities;L&&L.supportsQueryWithResultType&&(d.resultType="tile"),_=null,g&&(_=this._getRequestId(t,h),this._isPending(_))||(this._pending++,m.push(t._task.execute(d,function(){var e=h;return function(t){C.apply(v,[t,e])}}.call(this),this._queryErrorHandler,_)))}this._removeOldCells(s),this._endCheck()},_drawFeatures:function(e,t){t.hasPartialFeatures=!!e.exceededTransferLimit,this._exceeds=this._exceeds||e.exceededTransferLimit,this._finalizeIO();var i,r,s=this.featureLayer,a=this.map,n=a.extent,o=t.extent,u=t.row,l=t.col,h=s.objectIdField,d=e.features,_=this._gridLayer,c=this._cellMap,f=t.latticeID,p=f?c[f]:c[u]&&c[u][l];if(t.resolution==_._resolution&&(f?f===_.getLatticeID(n):_.intersects(o,n)))if(p)s._sortFeatures(d),this._updateCell(p,d);else for(s._sortFeatures(d),t.features=d,f?c[f]=t:(c[u]=c[u]||{},c[u][l]=t),r=d.length,i=0;r>i;i++){var y=d[i],g=y.attributes[h];this._addFeatureIIf(g,y),this._incRefCount(g)}else p&&this._removeCell(u,l,f);this._endCheck()},_queryErrorHandler:function(e){this._finalizeIO(),this._hasPartialFeatures=!0,this.featureLayer._errorHandler(e),this._endCheck(!0)},_finalizeIO:function(){this._purgeRequests(),this._pending--},_endCheck:function(e){if(0===this._pending){this._processIOQueue();var t=this.featureLayer,i=t._trackManager;i&&(i.clearTracks(),i.addFeatures(t.graphics),t._ager&&r.forEach(t.graphics,function(e){e._shape&&t._repaint(e)}),i.moveLatestToFront(),i.drawTracks()),this.featureLayer._fireUpdateEnd(e&&new Error("FeatureLayer: an error occurred while updating the layer"),this._exceeds?{queryLimitExceeded:!0}:null),this._exceeds&&t.onQueryLimitExceeded()}},_processIOQueue:function(e){this._ioQueue=r.filter(this._ioQueue,function(e){var t=e.fired>-1?!1:!0;return t}),e&&r.forEach(this._ioQueue,this._cancelPendingRequest)},_getCurrentCells:function(e){var t,i=[],r=e||this._cellMap;for(t in r)if(r.hasOwnProperty(t)){var s=r[t];s&&(s.hasOwnProperty("row")||s.hasOwnProperty("latticeID")?i.push(s):"object"==typeof s&&i.push.apply(i,this._getCurrentCells(s)))}return i},_removeOldCells:function(e){var t,i,r=this._cellMap,s=this._gridLayer;for(t in r)if(r[t]){var a=r[t],n=a.latticeID,o=0,u=0;if(n)o++,n!==s.getLatticeID(e)&&(this._removeCell(null,null,n),u++);else for(i in a)if(a[i]){o++;var l=a[i].extent;s.intersects(l,e)||(this._removeCell(t,i),u++)}u===o&&delete r[t]}},_updateCell:function(e,t){var i,r=this.featureLayer,s=r.objectIdField,a=r._selectedFeatures,n=t.length;for(e.features=e.features||[],i=0;n>i;i++){var o=t[i],u=o.attributes[s],l=this._addFeatureIIf(u,o);l===o?(this._incRefCount(u),e.features.push(l)):u in a||(l.setGeometry(o.geometry),l.setAttributes(o.attributes))}},_removeCell:function(e,t,i){var r=this._cellMap,s=this.featureLayer,a=s.objectIdField,n=i?r[i]:r[e]&&r[e][t];if(n){i?delete r[i]:delete r[e][t];var o,u=n.features;for(o=0;o<u.length;o++){var l=u[o],h=l.attributes[a];this._decRefCount(h),h in s._selectedFeatures||this._removeFeatureIIf(h)}}}});return s("extend-esri")&&i.setObject("layers._OnDemandMode",h,a),h});
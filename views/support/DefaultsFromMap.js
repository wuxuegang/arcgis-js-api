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
// See http://js.arcgis.com/4.5/esri/copyright.txt for details.

define(["require","exports","../../core/tsSupport/declareExtendsHelper","../../core/tsSupport/decorateHelper","../../core/accessorSupport/decorators","../../core/arrayUtils","../../core/watchUtils","../../core/Accessor","../../core/HandleRegistry","../../portal/support/geometryServiceUtils","../../geometry/support/webMercatorUtils","../../geometry/support/heightModelInfoUtils"],function(e,t,i,n,r,a,s,o,l,p,c,d){var h=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t._handles=new l,t._waitTask=null,t._isStarted=!1,t._spatialReferenceCandidates=null,t._extentCandidates=null,t.isSpatialReferenceDone=!1,t.isTileInfoDone=!1,t.isHeightModelInfoSearching=!1,t.spatialReference=null,t.extent=null,t.heightModelInfo=null,t.vcsWkid=null,t.latestVcsWkid=null,t.mapCollectionPaths=o.DefaultMapCollectionPaths.slice(),t.tileInfo=null,t}return i(t,e),o=t,t.prototype.initialize=function(){var e=this;this.watch("mapCollectionPaths",function(){e._isStarted&&(e.reset(),e.start())})},t.prototype.destroy=function(){this._set("view",null),this._handles&&(this._handles.destroy(),this._handles=null,this._isStarted=!1),this._cancelLoading()},t.prototype.reset=function(){this._handles.removeAll(),this._isStarted=!1,this._set("isSpatialReferenceDone",!1),this._set("isTileInfoDone",!1),this._set("isHeightModelInfoSearching",!1),this._set("spatialReference",null),this._set("extent",null),this._set("heightModelInfo",null),this._set("vcsWkid",null),this._set("latestVcsWkid",null),this._set("tileInfo",null),this._spatialReferenceCandidates=null,this._extentCandidates=null},t.prototype.start=function(){this._handles.removeAll(),this._isStarted=!0;for(var e=this._updateLayerChange.bind(this),t=0,i=this.mapCollectionPaths;t<i.length;t++){var n=i[t],r=!0;this._handles.add(s.on(this.view,"map."+n,"change",e,e,e,r))}},t.prototype._ownerNameFromCollectionName=function(e){var t=e.lastIndexOf(".");return-1===t?"view":"view."+e.slice(0,t)},t.prototype._ensureLoadedOwnersFromCollectionName=function(e){for(var t,i=this._ownerNameFromCollectionName(e),n=i.split("."),r=0;r<n.length&&(t=this.get(n.slice(0,r+1).join(".")),t);r++)if(t.load&&!t.isFulfilled())return{owner:null,loading:t.load()};return{owner:t}},t.prototype._cancelLoading=function(){this._waitTask=null,this._extentProjectTask&&(this._extentProjectTask.cancel(),this._extentProjectTask=null)},t.prototype._updateWhen=function(e){var t=this,i=!0,n=!1,r=e.always(function(){i?n=!0:r===t._waitTask&&t._update()});return i=!1,n||(this._waitTask=r),n},t.prototype._updateLayerChange=function(){this.isSpatialReferenceDone&&!this.spatialReference&&this._set("isSpatialReferenceDone",!1),this._update()},t.prototype._update=function(){var e=this;if(this._cancelLoading(),this.view){if(!this.isSpatialReferenceDone){var t=this._processMapCollections(function(t){return e._processSpatialReferenceSource(t)});if(0!==t){var i=null,n=this._spatialReferenceCandidates;!n||n.length<1?i=this.defaultSpatialReference:(this.defaultSpatialReference&&n.length>1&&a.findIndex(n,function(t){return t.equals(e.defaultSpatialReference)})>-1&&(n=[this.defaultSpatialReference]),i=n[0]),this._set("spatialReference",i),this._set("isSpatialReferenceDone",!0),i&&(this._processMapCollections(function(t){return e._findExtent(t,i)}),this.extent||this._projectExtentCandidate())}}if(null==this.heightModelInfo&&this.view.isHeightModelInfoRequired){var r=this._processMapCollections(function(t){return e._processHeightModelInfoSource(t)},function(e){return d.mayHaveHeightModelInfo(e)});this._set("isHeightModelInfoSearching",0===r)}if(null==this.tileInfo){var s=!1;this.view.isTileInfoRequired()&&(s=this._deriveTileInfo()),s||this._set("isTileInfoDone",!0)}}},t.prototype._processMapCollections=function(e,t){for(var i=0,n=this.mapCollectionPaths;i<n.length;i++){var r=n[i],a="map."+r,s=this._ensureLoadedOwnersFromCollectionName(a);if(s.loading&&!this._updateWhen(s.loading))return 0;var o=s.owner;if(!(!o||o.isRejected&&o.isRejected())){var l=this.view.get(a);if(l){var p=this._processMapCollection(l,e,t);if(2!==p)return p}}}return 2},t.prototype._processMapCollection=function(e,t,i){for(var n=0;n<e.length;n++){var r=e.getItemAt(n),a=null!=i&&!i(r);if(!a&&r.load&&!r.isFulfilled()&&!this._updateWhen(r.load()))return 0;if(!a&&(!r.load||r.isResolved())){if(t(r))return 1;var s=r;if(s.layers){var o=this._processMapCollection(s.layers,t);if(2!==o)return o}}}return 2},t.prototype._processSpatialReferenceSource=function(e){var t=this._getSupportedSpatialReferences(e);return 0===t.length?!1:(this._spatialReferenceCandidates?(t=a.intersect(t,this._spatialReferenceCandidates,function(e,t){return e.equals(t)}),t.length>0&&(this._spatialReferenceCandidates=t)):this._spatialReferenceCandidates=t,1===this._spatialReferenceCandidates.length)},t.prototype._findExtent=function(e,t){var i=e.fullExtents||(e.fullExtent?[e.fullExtent]:[]),n=a.find(i,function(e){return e.spatialReference.equals(t)});if(n)return this._set("extent",n),!0;if(this._getSupportedSpatialReferences(e).length>0){var r=i.map(function(t){return{extent:t,layer:e}}),s=this._extentCandidates||[];this._extentCandidates=s.concat(r)}return!1},t.prototype._projectExtentCandidate=function(){var e=this;if(this._extentCandidates&&this._extentCandidates.length){var t=this.spatialReference,i=a.find(this._extentCandidates,function(e){return c.canProject(e.extent.spatialReference,t)});if(i)this._set("extent",c.project(i.extent,t));else{var n=this._extentCandidates[0];this._extentProjectTask=p.projectGeometry(n.extent,t,n.layer.portalItem).then(function(t){e._set("extent",t)})}}},t.prototype._getSupportedSpatialReferences=function(e){var t=this,i=e.supportedSpatialReferences||(e.spatialReference?[e.spatialReference]:[]);return i.filter(function(i){return t.view.isSpatialReferenceSupported(i,e)})},t.prototype._processHeightModelInfoSource=function(e){var t=d.deriveHeightModelInfoFromLayer(e);return t?(this._set("heightModelInfo",t),this._set("isHeightModelInfoSearching",!1),e.spatialReference&&(this._set("vcsWkid",e.spatialReference.vcsWkid),this._set("latestVcsWkid",e.spatialReference.latestVcsWkid)),!0):!1},t.prototype._deriveTileInfo=function(){if(!this.isSpatialReferenceDone)return!0;var e=this.get("view.map");if(!e)return!0;var t=e.basemap,i=t&&t.get("baseLayers.0"),n=e.get("layers.0"),r=!1,a=null;return t?t.loaded?i?i.loaded?a=i.tileInfo:(this._updateWhen(i.load()),r=!0):n?n.loaded?a=n.tileInfo:(this._updateWhen(n.load()),r=!0):r=!0:(this._updateWhen(t.load()),r=!0):n&&(n.loaded?a=n.tileInfo:(this._updateWhen(n.load()),r=!0)),a&&!a.spatialReference.equals(this.spatialReference)&&(a=null),r||this._set("tileInfo",a),r},t.DefaultMapCollectionPaths=["basemap.baseLayers","layers","ground.layers","basemap.referenceLayers"],n([r.property({readOnly:!0})],t.prototype,"isSpatialReferenceDone",void 0),n([r.property({readOnly:!0})],t.prototype,"isTileInfoDone",void 0),n([r.property({readOnly:!0})],t.prototype,"isHeightModelInfoSearching",void 0),n([r.property({constructOnly:!0})],t.prototype,"view",void 0),n([r.property({readOnly:!0})],t.prototype,"spatialReference",void 0),n([r.property({readOnly:!0})],t.prototype,"extent",void 0),n([r.property({readOnly:!0})],t.prototype,"heightModelInfo",void 0),n([r.property({readOnly:!0})],t.prototype,"vcsWkid",void 0),n([r.property({readOnly:!0})],t.prototype,"latestVcsWkid",void 0),n([r.property()],t.prototype,"mapCollectionPaths",void 0),n([r.property()],t.prototype,"defaultSpatialReference",void 0),n([r.property({readOnly:!0})],t.prototype,"tileInfo",void 0),t=o=n([r.subclass("esri.views.support.DefaultsFromMap")],t);var o}(r.declared(o));return h});
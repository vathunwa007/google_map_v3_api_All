/**
 * wmsMapType.js
 *
 * Author: Beau Grantham
 * http://www.nologs.org/
 * https://github.com/beaugrantham/
 *
 * See here for license terms:
 * http://opensource.org/licenses/MIT
 */

function WmsMapType(name, url, params, options ,type="geoserver") {
    var TILE_SIZE = 256;
    var EARTH_RADIUS_IN_METERS = 6378137;
    var CIRCUMFERENCE = 2 * Math.PI * EARTH_RADIUS_IN_METERS;
    this.type = type;
    this.name = name;
    this.url = url;
    this.tileSize = new google.maps.Size(TILE_SIZE, TILE_SIZE); // required by API

    this.tiles = []; // maintain managed tiles

    /*
     * Params representing key/value pairs included in the GetMap query.
     *
     * Set default values and then override as needed.
     */
    this.params = {
        // General
        service: 'WMS',
        version: '1.1.1',
        request: 'GetMap',

        // Image props
        transparent: true,
        format: 'image/png',
        width: this.tileSize.width,
        height: this.tileSize.height,

        // Spatial Reference System
        srs: 'EPSG:3857',

        // Style
        styles: '',

        // Layers
        layers: ''
    };

    for (var key in params) {
        this.params[key] = params[key];
    }

    /*
     * Extra options.
     *
     * Set default values and then override as needed.
     */
    this.options = {
        opacity: 0.5,
        cache: true
    };

    for (var key in options) {
        this.options[key] = options[key];
    }

    /*
     * Prototype getTile method.
     */
    this.getTile = function(coord, zoom, ownerDocument) {
        if (!this.params['layers'].length) {
            console.log("[WmsMapType] Required param 'layers' is empty");
            return ownerDocument.createElement('div'); // empty div
        }
        var url = this.url + "?";

        for (var key in this.params) {
            url += key + "=" + this.params[key] + "&";
        }

        var bounds = getBounds(coord.x, coord.y, zoom);
        url += 'bbox=' + bounds.swX + "," + bounds.swY + "," + bounds.neX + "," + bounds.neY;

        if (this.options['cache'] == false) {
            var date = new Date();
            url += "&cache=" + date.getTime();
        }

        var div = ownerDocument.createElement('div');
        div.innerHTML = '<img src="' + url + '"/>';
        div.style.width = this.tileSize.width + 'px';
        div.style.height = this.tileSize.height + 'px';
        div.style.opacity = this.options['opacity'];

        this.tiles.push(div);

        return div;
    };

    /*
     * Add this MapType to a map at the given index, or on top of other layers
     * if index is omitted.
     */
    this.addToMap = function(map, index) {
        console.log(this)
        if (index !== undefined) {
            map.overlayMapTypes.insertAt(Math.min(index, map.overlayMapTypes.getLength()), this);
        } else {
            if(this.type == "geoserver"){
            map.overlayMapTypes.push(this);
            }else{
                this.Arcgiswms(map);
            }

            //this.zoomToWms(map);
        }
    };
    /*
     * Remove this MapType from a map.
     */
    this.removeFromMap = function(map) {
        var overlayTypes = map.overlayMapTypes;

        for (var i = 0; i < overlayTypes.getLength(); i++) {
            var element = overlayTypes.getAt(i);
      /*       console.log("element",element.name)
            console.log("thisis",this.name) */
            if (element.name !== undefined && element.name === this.name) {/*ตอนแรกเช็คแค่ element อย่างเดียว*/
                overlayTypes.removeAt(i);
                break;
            }
        }

        this.tiles = [];
    };
    /*
     * Change opacity on demand.
     */
    this.setOpacity = function(opacity) {
        this.options['opacity'] = opacity;

        for (var i in this.tiles) {
            this.tiles[i].style.opacity = opacity;
        }
    }

    this.zoomToWms = function(map) {

        if (!this.params['layers'].length) {
            console.log("[WmsMapType] Required param 'layers' is empty");
            return;
        }
        var url = this.url + "?";


        url += "service=" + this.params['service'] + "&";
        url += "version=" + this.params['version'] + "&";
        url += "request=" + "GetCapabilities" + "&";

        var isLayerNamespace = false;
        if (this.params['layers'].indexOf(':') > -1) {
            var tmpNamepace = this.params['layers'].split(':');
            if (tmpNamepace.length > 1) {
                url += "namespace=" + tmpNamepace[0] + "&";
                isLayerNamespace = true;
            }
        }

        if (!isLayerNamespace) {
            url += "namespace=" + this.params['layers'] + "&";
        }

        if (this.options['cache'] == false) {
            var date = new Date();
            url += "&cache=" + date.getTime();
        }

        var thisWms = this;
        url = encodeURIComponent(url);

        angular.element('#ang-controller').scope().GetWmsBoundary(url, this.params['layers']);
        //console.log(angular.element('#ang-controller').scope())
        //console.log(url, this.params['layers'])
        //$('#map-left').scope().GetWmsBoundary(url, this.params['layers']);

        /*
        data.url = url;

        var settings = {
        	"url": "http://localhost:58328/api/Map/GetWmsBoundary",
        	"method": "GET",
        	"headers": {
        		"Content-Type": "application/json"
        	},
        	"data": data,
        };

        $.ajax(settings).success(function (html) {
        	if (html != "" & html != null && html.indexOf('version') > -1) {
        		var wmsData = new WMSCapabilities().parse(html);

        		if (wmsData != null && wmsData.Capability != null && wmsData.Capability.Layer != null && wmsData.Capability.Layer.Layer != null) {
        			var layerList = wmsData.Capability.Layer.Layer;

        			for (var i = 0; i < layerList.length; ++i) {
        				if (layerList[i].Name == thisWms.params['layers']) {
        					if (layerList[i].LatLonBoundingBox != null) {
        						//return layerList[i].LatLonBoundingBox;
        						var bounds = new google.maps.LatLngBounds(
        							new google.maps.LatLng(layerList[i].LatLonBoundingBox[0], layerList[i].LatLonBoundingBox[1]),
        							new google.maps.LatLng(layerList[i].LatLonBoundingBox[2], layerList[i].LatLonBoundingBox[3])
        						);

        						var center = bounds.getCenter();

        						map.fitBounds(bounds);
        						return;
        					}
        					else {
        						console.log('boundaryError');
        					}
        				}
        			}
        		}
        	}
        });*/
    };
    this.zoomToWmsSwipe = function(map) { /*-------------------- Zooomtowms ชองหน้า Swipe map----------------*/

            if (!this.params['layers'].length) {
                console.log("[WmsMapType] Required param 'layers' is empty");
                return;
            }
            var url = this.url + "?";


            url += "service=" + this.params['service'] + "&";
            url += "version=" + this.params['version'] + "&";
            url += "request=" + "GetCapabilities" + "&";

            var isLayerNamespace = false;
            if (this.params['layers'].indexOf(':') > -1) {
                var tmpNamepace = this.params['layers'].split(':');
                if (tmpNamepace.length > 1) {
                    url += "namespace=" + tmpNamepace[0] + "&";
                    isLayerNamespace = true;
                }
            }

            if (!isLayerNamespace) {
                url += "namespace=" + this.params['layers'] + "&";
            }

            if (this.options['cache'] == false) {
                var date = new Date();
                url += "&cache=" + date.getTime();
            }

            var thisWms = this;
            url = encodeURIComponent(url);


            //console.log(angular.element('#ang-controller').scope())
            //console.log(url, this.params['layers'])
            //$('#map-left').scope().GetWmsBoundary(url, this.params['layers']);
            return {
                url: url,
                param: this.params['layers']
            }
        }


        this.Arcgiswms =async function(map) {/*------------------------------------Arcgis wms addnew---------------------------*/
            var url = this.url+this.params.layers+"/MapServer";
            var agsType = await new gmaps.ags.MapType(url, {
                name: this.name,
                opacity: 1,
            });
            map.overlayMapTypes.insertAt(0, agsType);
            this.ZoomToArcgis(map);

        }
        this.ZoomToArcgis = function(map) {/*------------------------------------Arcgis wms addnew---------------------------*/
            /*   var svc = new gmaps.ags.MapService(`${url}`);
              console.log(svc) */
            // console.log(agsType.getTileLayers()[0].getMapService())
            var url = this.url+this.params.layers+"/MapServer";
            $.getJSON(`${url}/info/iteminfo?f=pjson`, function (result) {
                let lat = result.extent[0][1];
                let lng = result.extent[0][0];
                let lat2 = result.extent[1][1];
                let lng2 = result.extent[1][0];
                var bounds = new google.maps.LatLngBounds();
                var points = [
                    new google.maps.LatLng(lat, lng),
                    new google.maps.LatLng(lat2, lng2)
                ];
                // Extend bounds with each point
                for (var i = 0; i < points.length; i++) {
                    bounds.extend(points[i]);
                    //new google.maps.Marker({ position: points[i], map: map });
                }
                /*  var pt = new google.maps.LatLng(lat,lng);
                 bounds.extend(pt); */
                map.fitBounds(bounds);
            });
        }

        /*---------------------------------------------------------------------------------------------------------------------*/

        /*
         * ---------------
         * Private methods
         * ---------------
         */

    /*
     * Return the tile bounds for the given x, y, z values.
     */

/*---------------------------------------------------------------------------------------------------------------------*/
    function getBounds(x, y, z) {
        y = Math.pow(2, z) - y - 1; // Translate Y value

        var resolution = (CIRCUMFERENCE / TILE_SIZE) / Math.pow(2, z); // meters per pixel

        var swPoint = getMercatorCoord(x, y, resolution);
        var nePoint = getMercatorCoord(x + 1, y + 1, resolution);

        var bounds = {
            swX: swPoint.x,
            swY: swPoint.y,
            neX: nePoint.x,
            neY: nePoint.y
        };

        return bounds;
    };

    /*
     * Translate the xy & resolution to spherical mercator (EPSG:3857, EPSG:900913).
     */
    function getMercatorCoord(x, y, resolution) {
        var point = {
            x: x * TILE_SIZE * resolution - CIRCUMFERENCE / 2.0,
            y: y * TILE_SIZE * resolution - CIRCUMFERENCE / 2.0
        };

        return point;
    };
}
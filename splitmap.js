app.controller("splitmapController", function($scope, ngAuthSettings, $sessionStorage, $mdDialog, mdDialogShow, MAPSPRITE) {

            $scope.info = {
                    lat: 0,
                    lng: 0,
                    utm: "",
                }
                // $scope.xml = {
                //     style: [],
                //     polyline: [],
                //     circle: [],
                //     polygon: [],
                //     marker: [],
                // }

            var drawingManager;
            var drawings = [];
            var selectedShape;
            var selectcolor = "rgb(255, 0, 0,1)";
            $scope.colors = ['rgb(255, 0, 0,1)', 'rgb(255, 255, 0,1)', 'rgb(0, 255, 0,1)', 'rgb(0, 0, 255,1)'];

            $scope.init = () => {
                    const width = document.getElementById("container").offsetWidth;
                    document.getElementById("map-left").style.width = `${width}px`;
                    document.getElementById("map-right").style.width = `${width}px`;
                    $scope.rangcolor = 100;
                    var add = new WmsMapType(
                        "เขื่อนป้องกันการกัดเซาะแม่น้ำท่าจีน อ.เมือง จ.สมุทรสาคร ระยะที่ 2",
                        "http://164.115.61.179/geoserver/imis/wms?", {
                            layers: "PanThaiNorRaSing",
                            wmsProjectKey: "B0065-1-2",
                        }, {
                            opacity: 1
                        }
                    );

                    /*--------------------------------swipe map *--------------*/
                    initMap();

                    var mapLeft, mapRight;
                    var instance;


                    function initMap() {
                        $scope.rangcolor = 100;
                        const mapOptions = {
                            center: {
                                lat: 13.735633,
                                lng: 100.512091,
                            },
                            disableDefaultUI: true,
                            zoom: 6,
                            scaleControl: false,
                            streetViewControl: false
                        }; // instantiate the map on the left with control positioning

                        mapLeft = new google.maps.Map(document.getElementById("map-left"), {
                            ...mapOptions,
                            mapTypeId: "satellite",
                            tilt: 0,
                            // at high zoom levels we need to maintain the same projection
                            fullscreenControlOptions: {
                                position: google.maps.ControlPosition.LEFT_BOTTOM
                            },
                            mapTypeControlOptions: {
                                position: google.maps.ControlPosition.LEFT_TOP
                            },
                            zoomControlOptions: {
                                position: google.maps.ControlPosition.LEFT_BOTTOM
                            }
                        }); // instantiate the map on the right with control positioning

                        mapRight = new google.maps.Map(document.getElementById("map-right"), {
                            ...mapOptions,
                            fullscreenControlOptions: {
                                position: google.maps.ControlPosition.RIGHT_BOTTOM
                            },
                            mapTypeControlOptions: {
                                position: google.maps.ControlPosition.RIGHT_TOP

                            },
                            zoomControlOptions: {
                                position: google.maps.ControlPosition.RIGHT_BOTTOM
                            }

                        }); // helper function to keep maps in sync

                        function sync(...maps) {
                            let center, zoom;


                            function update(changedMap) {
                                maps.forEach(m => {
                                    if (m === changedMap) {
                                        return;
                                    }

                                    m.setCenter(center);
                                    m.setZoom(zoom);
                                });
                            }
                            maps.forEach(m => { //สั่งงาน map ทั้งสองในนี้


                                $scope.swipeMap = function sync(...maps) {
                                    console.log("swipeMap");


                                }

                                m.addListener('mousemove', (event) => {
                                    // console.log(event.latLng.toString())
                                    $scope.info.lat = event.latLng.lat();
                                    $scope.info.lng = event.latLng.lng();
                                    $scope.info.utm = (new LatLng($scope.info.lat, $scope.info.lng)).toUTMRef().toString().replace(/([0-9.]+) ([0-9.]+)/, '$1, $2');
                                    /*  console.log("$scope.info", $scope.info) */
                                    document.getElementById('latlong').innerHTML = "Lat/Long" + event.latLng.lat() + "/" + event.latLng.lng();
                                    document.getElementById('utm').innerHTML = "UTM[" + $scope.info.utm + ']';
                                });
                                let mapzoomin = document.getElementById('mapzoomin').addEventListener('click', () => {
                                    m.setZoom(mapRight.getZoom() + 1);
                                })
                                let mapzoomout = document.getElementById('mapzoomout').addEventListener('click', () => {
                                    m.setZoom(mapRight.getZoom() - 1);
                                })
                                let home = document.getElementById('home').addEventListener('click', () => {
                                    m.setCenter(new google.maps.LatLng(13.0726, 100.766));
                                    m.setZoom(6);

                                })

                                m.addListener("bounds_changed", () => {
                                    const changedCenter = m.getCenter();
                                    const changedZoom = m.getZoom();

                                    if (changedCenter !== center || changedZoom !== zoom) {
                                        center = changedCenter;
                                        zoom = changedZoom;
                                        update(m);
                                    }
                                });
                            });
                            return maps;
                        }

                        sync(mapLeft, mapRight);

                        function handleContainerResize() {
                            const width = document.getElementById("container").offsetWidth;
                            console.log(width)
                            document.getElementById("map-left").style.width = `${width}px`;
                            document.getElementById("map-right").style.width = `${width}px`;
                        } // trigger to set map container size since using absolute
                        setTimeout(function() { handleContainerResize(); }, 1000); //ให้มันโหลดDomเสร็จก่อนถึงคำนวนความกว้างใช้ไปก่อนชั่วคราว
                        // add event listener

                        window.addEventListener("resize", handleContainerResize);


                        instance = Split(["#left", "#right"], {
                            sizes: [110, 0],
                            snapOffset: 50,
                            gutterSize: 5,
                            minSize: [50, 50],

                        });
                        $('.gutter').hide();


                        /*----------------------add Buttoncontroll to map-----------------------*/
                        /*  var centerControlDiv = document.createElement("div");
                         var centerControl = new CenterControl(centerControlDiv, mapLeft);

                         centerControlDiv.index = 1;
                         mapLeft.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv); */



                    }
                    MAPSPRITE.getMAPALL(mapLeft, mapRight, instance)
                        /*---------------addEvenlistenerdrawing  Map---------------*/

                    var drawingManager = new google.maps.drawing.DrawingManager({
                        drawingControl: false,
                        /* drawingControlOptions: {
                            position: google.maps.ControlPosition.TOP_CENTER,
                            drawingModes: ['marker', 'circle', 'polygon', 'polyline', 'rectangle']
                        }, */
                        markerOptions: {
                            icon: 'https://sv1.picz.in.th/images/2020/08/04/EwK7Cg.png',
                            editable: false,
                            draggable: false,
                            zIndex: 1,
                        },
                        circleOptions: {
                            fillColor: 'rgb(255, 0, 0,1)',
                            fillOpacity: $scope.rangcolor / 100,
                            strokeWeight: 2,
                            editable: false,
                            draggable: false,

                        },
                        polygonOptions: {
                            fillColor: 'rgb(255, 0, 0,1)',
                            strokeWeight: 2,
                            fillOpacity: $scope.rangcolor / 100,
                            editable: false,
                            draggable: false
                        },
                        polylineOptions: {
                            strokeWeight: 2,
                            strokeColor: 'rgb(255, 0, 0,1)',
                            fillOpacity: $scope.rangcolor / 100,
                            editable: false,

                        },
                        rectangleOptions: {
                            strokeWeight: 2,
                            fillColor: 'rgb(255, 0, 0,1)',
                            fillOpacity: $scope.rangcolor / 100,
                            editable: false,
                            draggable: false
                        }
                    });
                    drawingManager.setMap(mapLeft);
                    google.maps.event.addDomListener(hand, 'click', function() {
                        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.null);
                    });
                    google.maps.event.addDomListener(line, 'click', function() {
                        let randomid = Math.floor(Math.random() * 100);
                        var polylineOptions = drawingManager.get('polylineOptions');
                        polylineOptions.id = randomid;
                        drawingManager.set('polylineOptions', polylineOptions);
                        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
                    });
                    /*   google.maps.event.addDomListener(rect, 'click', function() {
                          drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
                      }); */
                    google.maps.event.addDomListener(circle, 'click', function() {
                        let randomid = Math.floor(Math.random() * 100);
                        var circleOptions = drawingManager.get('circleOptions');
                        circleOptions.id = randomid;
                        drawingManager.set('circleOptions', circleOptions);
                        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
                    });
                    google.maps.event.addDomListener(poly, 'click', function() {
                        let randomid = Math.floor(Math.random() * 100);
                        var polygonOptions = drawingManager.get('polygonOptions');
                        polygonOptions.id = randomid;
                        drawingManager.set('polygonOptions', polygonOptions);
                        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);

                    });
                    google.maps.event.addDomListener(marker, 'click', function() {
                        let randomid = Math.floor(Math.random() * 100);
                        var markerOptions = drawingManager.get('markerOptions');
                        markerOptions.id = randomid;
                        drawingManager.set('markerOptions', markerOptions);
                        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.MARKER);
                    });

                    /*--------------------------------------compleste drawing------------------------------------------------------------*/
                    /*  google.maps.event.addDomListener(drawingManager, 'rectanglecomplete', function(rectangle) {
                        console.log(rectangle)
                        path = rectangle.getPath().getArray();
                        document.getElementById("action").value += "#rectangle\n";
                        for (var i = 0; i < path.length; i++) {
                            document.getElementById("action").value += path.getAt(i) + "\n";
                        }
                    }); */
                    google.maps.event.addDomListener(drawingManager, 'markercomplete', function(marker) { /*-----MARKER-----*/
                        //console.log(marker);
                        document.getElementById("action").value += "#marker\n";
                        document.getElementById("action").value += marker.getPosition() + "\n";
                        icon = marker.icon;
                        type = "marker";
                        styleid = marker.id;
                        style = {
                            type: type,
                            icon: icon,
                            styleid: styleid,
                        }
                        condinate = {
                            type: type,
                            condinate: [marker.getPosition().lng() + ',' + marker.getPosition().lat() + ",0" + '\n'],
                            styleid: styleid,
                        }
                        $scope.xml.style.push(style);
                        $scope.xml.marker.push(condinate);
                        $scope.xml.drawing = [condinate, ...$scope.xml.drawing];


                    });
                    google.maps.event.addDomListener(drawingManager, 'circlecomplete', function(circle) { /*-----CIRCLE-----*/
                        var condinate = [];
                        var getpathcircle = new google.maps.Circle({
                            radius: circle.radius,
                            center: circle.getCenter(),

                        });

                        var path = circlePath(getpathcircle);
                        document.getElementById("action").value += "#circle\n";
                        for (var i = 0; i < path.length; i++) {
                            document.getElementById("action").value += path[i] + "\n";
                            condinate.push(path[i].lng() + ',' + path[i].lat() + ",0" + '\n')
                        }
                        color = circle.fillColor;
                        opacity = circle.fillOpacity;
                        type = circle.type;
                        stork = circle.strokeColor;
                        styleid = circle.id;

                        style = {
                            type: type,
                            color: converter.rgbaToKml(rgbcovert(color, opacity)),
                            styleid: styleid,
                        }
                        condinate = {
                            type: type,
                            condinate: condinate,
                            center: circle.getCenter().toUrlValue(),
                            styleid: styleid,
                        }
                        $scope.xml.style.push(style);
                        $scope.xml.circle.push(condinate);
                        $scope.xml.drawing = [condinate, ...$scope.xml.drawing];


                    });
                    google.maps.event.addDomListener(drawingManager, 'polylinecomplete', function(line) { /*-----LINE-----*/
                        path = line.getPath();
                        condinate = [];
                        document.getElementById("action").value += "#polyline\n";
                        for (var i = 0; i < path.length; i++) {
                            document.getElementById("action").value += path.getAt(i) + "\n";
                            condinate.push(path.getAt(i).lng() + ',' + path.getAt(i).lat() + ",0" + '\n');
                        }

                        opacity = line.fillOpacity;
                        type = line.type;
                        storkcolor = line.strokeColor;
                        styleid = line.id;
                        style = {
                            type: type,
                            styleid: styleid,
                            color: converter.rgbaToKml(rgbcovert(storkcolor, opacity)),
                        }
                        condinate = {
                            type: type,
                            condinate: condinate,
                            styleid: styleid,
                        }
                        $scope.xml.style.push(style);
                        $scope.xml.polyline.push(condinate);
                        $scope.xml.drawing = [condinate, ...$scope.xml.drawing];

                        // console.log($scope.xml)
                        console.log(line)
                    });

                    google.maps.event.addDomListener(drawingManager, 'polygoncomplete', function(polygon) { /*-----POLYGON-----*/

                        path = polygon.getPath();
                        condinate = [];
                        document.getElementById("action").value += "#polygon\n";
                        for (var i = 0; i < path.length; i++) {
                            document.getElementById("action").value += path.getAt(i) + '\n';
                            condinate.push(path.getAt(i).lng() + ',' + path.getAt(i).lat() + ",0" + '\n');

                        }
                        opacity = polygon.fillOpacity;
                        type = polygon.type;
                        color = polygon.fillColor;
                        styleid = polygon.id;
                        style = {
                            type: type,
                            styleid: styleid,
                            color: converter.rgbaToKml(rgbcovert(color, opacity)),
                        }
                        condinate = {
                                type: type,
                                condinate: condinate,
                                styleid: styleid,
                            }
                            //console.log(condinate)
                        $scope.xml.style.push(style);
                        $scope.xml.polygon.push(condinate);
                        $scope.xml.drawing = [condinate, ...$scope.xml.drawing];

                        //console.log(createxml())
                    });
                    // Clear the current selection when the drawing mode is changed, or when the
                    // map is clicked.
                    //google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
                    google.maps.event.addListener(mapLeft, 'click', clearSelection);
                    google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteSelectedShape);
                    google.maps.event.addDomListener(document.getElementById('delete-all-button'), 'click', deleteAllShape);
                    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
                        drawings.push(e);
                        drawingManager.setDrawingMode(null);
                        if (e.type != google.maps.drawing.OverlayType.MARKER) {
                            // Switch back to non-drawing mode after drawing a shape.
                            // Add an event listener that selects the newly-drawn shape when the user
                            // mouses down on it.
                            var newShape = e.overlay;
                            newShape.type = e.type;
                            google.maps.event.addListener(newShape, 'click', function(e) {
                                setSelection(newShape);
                            });

                            //setSelection(newShape); /*เมื่อวาดเสร็จให้ปรับแต่ง*/
                        } else {
                            var newShape = e.overlay;
                            newShape.type = e.type;
                            google.maps.event.addListener(newShape, 'click', function(e) {
                                setSelection(newShape);
                            });

                        }

                    });
                    /*-------------------------------สร้าง textboxไว้บอกชื่อ WMS-----------------------*/
                    /*  function CustomControl(controlDiv, map, position) {
                        // Set CSS for the control border
                        if (position == "left") {
                            var controlUI = document.createElement('div');
                            controlUI.style.backgroundColor = '#FFF';
                            controlUI.style.borderStyle = 'solid';
                            controlUI.style.width = '25rem';
                            controlUI.style.borderWidth = '1px';
                            controlUI.style.borderColor = '#ccc';
                            controlUI.style.marginTop = '50px';
                            controlUI.style.marginLeft = '100px';
                            controlUI.style.cursor = 'pointer';
                            controlUI.style.textAlign = 'center';
                            controlUI.title = 'Click to set the map to Home';
                            controlDiv.appendChild(controlUI);
                            // Set CSS for the control interior
                            var controlText = document.createElement('div');
                            controlText.style.fontFamily = 'Arial,sans-serif';
                            controlText.style.fontSize = '9px';
                            controlText.style.paddingLeft = '4px';
                            controlText.style.paddingRight = '4px';
                            controlText.style.paddingTop = '7px';
                            controlText.style.paddingBottom = '7px';
                            controlText.innerHTML = 'Custom';
                            controlUI.appendChild(controlText);
                        } else {
                            var controlUI = document.createElement('div');
                            controlUI.style.backgroundColor = '#FFF';
                            controlUI.style.borderStyle = 'solid';
                            controlUI.style.width = '25rem';
                            controlUI.style.borderWidth = '1px';
                            controlUI.style.borderColor = '#ccc';
                            controlUI.style.marginTop = '50px';
                            controlUI.style.marginRight = '100px';
                            controlUI.style.cursor = 'pointer';
                            controlUI.style.textAlign = 'center';
                            controlUI.title = 'Click to set the map to Home';
                            controlDiv.appendChild(controlUI);
                            // Set CSS for the control interior
                            var controlText = document.createElement('div');
                            controlText.style.fontFamily = 'Arial,sans-serif';
                            controlText.style.fontSize = '9px';
                            controlText.style.paddingLeft = '4px';
                            controlText.style.paddingRight = '4px';
                            controlText.style.paddingTop = '7px';
                            controlText.style.paddingBottom = '7px';
                            controlText.innerHTML = 'Custom';
                            controlUI.appendChild(controlText);
                        }
                        // Setup the click event listeners
                        google.maps.event.addDomListener(controlUI, 'click', function() {
                            alert('Custom control clicked');
                        });
                    }
                    var customControlDivLEFT = document.createElement('div');
                    var customControlDivRIGHT = document.createElement('div');
                    var texboxLeft = new CustomControl(customControlDivLEFT, mapLeft, "left");
                    var texboxRight = new CustomControl(customControlDivRIGHT, mapRight, "right");
                    customControlDivLEFT.index = 1;
                    customControlDivRIGHT.index = 1;
                    mapLeft.controls[google.maps.ControlPosition.TOP_LEFT].push(customControlDivLEFT);
                    mapRight.controls[google.maps.ControlPosition.TOP_RIGHT].push(customControlDivRIGHT);
 */
                    /*---------------------------------------------------// Make the DIV element draggable:--------------------------*/
                    dragElement(document.getElementById("mydiv"));

                    function dragElement(elmnt) {
                        var pos1 = 0,
                            pos2 = 0,
                            pos3 = 0,
                            pos4 = 0;
                        if (document.getElementById(elmnt.id + "header")) {
                            // if present, the header is where you move the DIV from:
                            document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
                        } else {
                            // otherwise, move the DIV from anywhere inside the DIV:
                            elmnt.onmousedown = dragMouseDown;
                        }

                        function dragMouseDown(e) {
                            e = e || window.event;
                            e.preventDefault();
                            // get the mouse cursor position at startup:
                            pos3 = e.clientX;
                            pos4 = e.clientY;
                            document.onmouseup = closeDragElement;
                            // call a function whenever the cursor moves:
                            document.onmousemove = elementDrag;
                        }

                        function elementDrag(e) {
                            e = e || window.event;
                            e.preventDefault();
                            // calculate the new cursor position:
                            pos1 = pos3 - e.clientX;
                            pos2 = pos4 - e.clientY;
                            pos3 = e.clientX;
                            pos4 = e.clientY;
                            // set the element's new position:
                            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
                        }

                        function closeDragElement() {
                            // stop moving when mouse button is released:
                            document.onmouseup = null;
                            document.onmousemove = null;
                        }
                    }
                    /*-----------------------------------------------------------------------------------------------------*/
                    $scope.selectColor = (color) => {
                        if (selectedShape != null) {
                            if (selectedShape.type != "polyline") {
                                selectedShape.set('fillColor', color);
                            } else {
                                selectedShape.set('strokeColor', color);
                            }
                        }
                        selectcolor = color;
                        var index = $scope.colors.indexOf(color);
                        for (var i = 0; i < $scope.colors.length; ++i) {
                            $('#color' + i).removeClass("clckevent");
                        }
                        $('#color' + index).addClass("clckevent");
                        var polylineOptions = drawingManager.get('polylineOptions');
                        polylineOptions.strokeColor = color;
                        drawingManager.set('polylineOptions', polylineOptions);

                        var circleOptions = drawingManager.get('circleOptions');
                        circleOptions.fillColor = color;
                        drawingManager.set('circleOptions', circleOptions);

                        var polygonOptions = drawingManager.get('polygonOptions');
                        polygonOptions.fillColor = color;
                        drawingManager.set('polygonOptions', polygonOptions);
                        var rectangleOptions = drawingManager.get('rectangleOptions');
                        rectangleOptions.fillColor = color;
                        drawingManager.set('rectangleOptions', rectangleOptions);
                        //console.log(color)
                    }
                    $scope.setopacitycolor = () => {

                        let opacity = parseFloat("0." + $scope.rangcolor);
                        var polylineOptions = drawingManager.get('polylineOptions');
                        polylineOptions.fillOpacity = opacity;
                        drawingManager.set('polylineOptions', polylineOptions);

                        var circleOptions = drawingManager.get('circleOptions');
                        circleOptions.fillOpacity = opacity;
                        drawingManager.set('circleOptions', circleOptions);

                        var polygonOptions = drawingManager.get('polygonOptions');
                        polygonOptions.fillOpacity = opacity;
                        drawingManager.set('polygonOptions', polygonOptions);
                        var rectangleOptions = drawingManager.get('rectangleOptions');
                        rectangleOptions.fillOpacity = opacity;
                        drawingManager.set('rectangleOptions', rectangleOptions);
                        if (selectedShape != null) {
                            if (selectedShape.type != "polyline") {
                                selectedShape.set('fillOpacity', opacity);
                            } else {
                                selectedShape.set('strokeColor', "rgb(" + rgbcovert(selectcolor, opacity.toString()) + ")");
                            }

                        }
                    }

                    function EditDrawing(shape) {
                        if (shape) {
                            if (shape.type == "marker") {
                                icon = shape.icon;
                                type = "marker";
                                styleid = shape.id;
                                style = {
                                    type: type,
                                    icon: icon,
                                    styleid: styleid,
                                }
                                condinate = {
                                    type: type,
                                    condinate: [shape.getPosition().lng() + ',' + shape.getPosition().lat() + ",0" + '\n'],
                                    styleid: styleid,
                                }
                                let index = $scope.xml.drawing.findIndex(item => item.styleid == styleid)
                                $scope.xml.drawing[index] = condinate;


                            } else if (shape.type == "polygon") {
                                path = shape.getPath();
                                condinate = [];

                                for (var i = 0; i < path.length; i++) {
                                    document.getElementById("action").value += path.getAt(i) + '\n';
                                    condinate.push(path.getAt(i).lng() + ',' + path.getAt(i).lat() + ",0" + '\n');
                                }
                                opacity = shape.fillOpacity;
                                type = shape.type;
                                color = shape.fillColor;
                                styleid = shape.id;
                                style = {
                                    type: type,
                                    styleid: styleid,
                                    color: converter.rgbaToKml(rgbcovert(color, opacity)),
                                }
                                condinate = {
                                    type: type,
                                    condinate: condinate,
                                    styleid: styleid,
                                }
                                let index = $scope.xml.drawing.findIndex(item => item.styleid == styleid)
                                let indexstyle = $scope.xml.style.findIndex(item => item.styleid == styleid)
                                $scope.xml.drawing[index] = condinate;
                                $scope.xml.style[indexstyle] = style;

                            } else if (shape.type == "polyline") {
                                path = shape.getPath();
                                condinate = [];
                                document.getElementById("action").value += "#polyline\n";
                                for (var i = 0; i < path.length; i++) {
                                    document.getElementById("action").value += path.getAt(i) + "\n";
                                    condinate.push(path.getAt(i).lng() + ',' + path.getAt(i).lat() + ",0" + '\n');
                                }

                                opacity = shape.fillOpacity;
                                type = shape.type;
                                storkcolor = shape.strokeColor;
                                styleid = shape.id;
                                style = {
                                    type: type,
                                    styleid: styleid,
                                    color: converter.rgbaToKml(rgbcovert(storkcolor, opacity)),
                                }
                                condinate = {
                                    type: type,
                                    condinate: condinate,
                                    styleid: styleid,
                                }
                                let index = $scope.xml.drawing.findIndex(item => item.styleid == styleid)
                                let indexstyle = $scope.xml.style.findIndex(item => item.styleid == styleid)
                                $scope.xml.drawing[index] = condinate;
                                $scope.xml.style[indexstyle] = style;

                            } else if (shape.type == "circle") {
                                var condinate = [];
                                var getpathcircle = new google.maps.Circle({
                                    radius: shape.radius,
                                    center: shape.getCenter(),
                                });
                                var path = circlePath(getpathcircle);
                                document.getElementById("action").value += "#circle\n";
                                for (var i = 0; i < path.length; i++) {
                                    document.getElementById("action").value += path[i] + "\n";
                                    condinate.push(path[i].lng() + ',' + path[i].lat() + ",0" + '\n')
                                }
                                color = shape.fillColor;
                                opacity = shape.fillOpacity;
                                type = shape.type;
                                stork = shape.strokeColor;
                                styleid = shape.id;

                                style = {
                                    type: type,
                                    color: converter.rgbaToKml(rgbcovert(color, opacity)),
                                    styleid: styleid,
                                }
                                condinate = {
                                    type: type,
                                    condinate: condinate,
                                    center: shape.getCenter().toUrlValue(),
                                    styleid: styleid,
                                }
                                let index = $scope.xml.drawing.findIndex(item => item.styleid == styleid)
                                let indexstyle = $scope.xml.style.findIndex(item => item.styleid == styleid)
                                $scope.xml.drawing[index] = condinate;
                                $scope.xml.style[indexstyle] = style;

                            }
                        }
                    }
                    $scope.shapesuccess = function() {
                        clearSelection()
                    }

                    function clearSelection() {
                        if (selectedShape) {
                            if (selectedShape.type != "marker") {
                                EditDrawing(selectedShape);
                                selectedShape.setEditable(false);
                                selectedShape = null;
                            } else {
                                EditDrawing(selectedShape);
                                selectedShape.setDraggable(false);
                                selectedShape.setAnimation(null);
                                selectedShape = null;

                            }
                        }

                    }

                    function setSelection(shape) {
                        clearSelection(); /*ปิดไว้ก่อนนนน*/
                        selectedShape = shape;
                        if (shape.type != "marker") {
                            shape.setEditable(true); /*ปิดไว้ก่อนนนน*/

                        } else {
                            selectedShape.setDraggable(true);
                            selectedShape.setAnimation(google.maps.Animation.BOUNCE);
                        }
                        //console.log(shape)
                    }

                    function deleteSelectedShape() {
                        if (selectedShape) {
                            selectedShape.setMap(null)
                            let checktype = selectedShape.type;
                            let styleiddelete = $scope.xml.style.filter(item => item.styleid != selectedShape.id);
                            if (checktype == "marker") {
                                let newmarker = $scope.xml.marker.filter(item => item.styleid != selectedShape.id);
                                $scope.xml.marker = newmarker;
                                $scope.xml.circle = $scope.xml.circle;
                                $scope.xml.polygon = $scope.xml.polygon;
                                $scope.xml.polyline = $scope.xml.polyline;
                            } else if (checktype == "circle") {
                                let newcircle = $scope.xml.circle.filter(item => item.styleid != selectedShape.id);
                                $scope.xml.circle = newcircle;
                                $scope.xml.marker = $scope.xml.marker;
                                $scope.xml.polygon = $scope.xml.polygon;
                                $scope.xml.polyline = $scope.xml.polyline;
                            } else if (checktype == "polygon") {
                                let newpolygon = $scope.xml.polygon.filter(item => item.styleid != selectedShape.id);
                                $scope.xml.polygon = newpolygon;
                                $scope.xml.circle = $scope.xml.circle;
                                $scope.xml.marker = $scope.xml.marker;
                                $scope.xml.polyline = $scope.xml.polyline;
                            } else if (checktype == "polyline") {
                                let newpolyline = $scope.xml.polyline.filter(item => item.styleid != selectedShape.id);
                                $scope.xml.polyline = newpolyline;
                                $scope.xml.circle = $scope.xml.circle;
                                $scope.xml.polygon = $scope.xml.polygon;
                                $scope.xml.marker = $scope.xml.marker;
                            }
                            $scope.xml.style = styleiddelete;
                        }
                    }

                    function deleteAllShape() {
                        $scope.xml.style = [];
                        $scope.xml.polyline = [];
                        $scope.xml.circle = [];
                        $scope.xml.polygon = [];
                        $scope.xml.marker = [];

                        for (var i = 0; i < drawings.length; i++) {
                            drawings[i].overlay.setMap(null);
                        }
                        drawings = [];
                    }

                    function rgbcovert(rgb, opacity) {
                        let a = rgb.toString().match(/\d+/g);
                        let color = "";
                        for (i = 0; i < a.length; i++) {
                            if (i == a.length - 1) {
                                color += opacity;
                            } else {
                                color += a[i] + ",";
                            }
                        }
                        //console.log(color)
                        return color;

                    }

                    function circlePath(circle) {
                        var numPts = 512;
                        var path = [];

                        for (var i = 0; i < numPts; i++) {
                            path.push(google.maps.geometry.spherical.computeOffset(circle.getCenter(), circle.getRadius(), i * 360 / numPts));
                        }
                        return path;
                    }

                    function createxml() {
                        var xml = "";
                        xml = `<?xml version="1.0" encoding="UTF-8"?>
                <kml xmlns="http://www.opengis.net/kml/2.2">
                  <Document>
                      ${$scope.xml.style.map(style =>
                style.type == "polygon" ?
                    `<Style id="${style.styleid}">
                    <LineStyle>
                    <color>64140000</color>
                    <width>5</width>
                </LineStyle>
                    <PolyStyle>
                    <color>${style.color}</color>
                    <fill>1</fill>
                    <width>5</width>
                    <outline>1</outline>
                </PolyStyle>
                </Style>`:
                    style.type == "marker" ?
                        `<Style id="${style.styleid}">
                <IconStyle>
                <scale>1.1</scale>
                <Icon>
                    <href>https://sv1.picz.in.th/images/2020/08/04/EwK7Cg.png</href>
                </Icon>
                <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
                </IconStyle>
                        </Style>`:
                        style.type == "polyline" ?
                            `<Style id="${style.styleid}">
                            <LineStyle><color>${style.color}</color><width>2</width></LineStyle>
                            <PolyStyle><color>${style.color}</color></PolyStyle>
                        </Style>`:
                            style.type == "circle" ?
                                `<Style id="${style.styleid}">
                                <PolyStyle>
                                <color>${style.color}</color>
                                <fill>1</fill>
                                <width>5</width>
                                <outline>1</outline>
                            </PolyStyle>
                            <IconStyle>
                                <Icon/>
                            </IconStyle>
                            <LineStyle>
                                <color>50000000</color>
                                <width>2</width>
                            </LineStyle>
                        </Style>`: ''
            )}
                        ${$scope.xml.polygon.map((xml, index) =>
                `<Placemark>
                        <name>Line one</name>
                        <styleUrl>#${xml.styleid}</styleUrl>
                        <Polygon>
                        <outerBoundaryIs>
                        <LinearRing>
                          <tessellate>1</tessellate>
                          <coordinates>
                            ${(xml.condinate).join('')}
                          </coordinates>
                        </LinearRing>
                        </outerBoundaryIs>
                        </Polygon>
                      </Placemark>`
            )}
            ${$scope.xml.marker.map((xml, index) =>
                `<Placemark>
                <name>IMIS</name>
                <styleUrl>#${xml.styleid}</styleUrl>
                <Point>
                    <coordinates>
                    ${(xml.condinate).join('')}
                    </coordinates>
                </Point>
            </Placemark>`
            )}
            ${$scope.xml.polyline.map((xml, index) =>
                `<Placemark>
                <name>IMIS</name>
                <styleUrl>#${xml.styleid}</styleUrl>
                <LineString>
                    <coordinates>
                    ${(xml.condinate).join('')}
                    </coordinates>
                </LineString>
            </Placemark>`
            )}
            ${$scope.xml.circle.map((xml, index) =>
                `<Placemark>
                <name>IMIS</name>
                <styleUrl>#${xml.styleid}</styleUrl>
                <Polygon>
        <extrude>1</extrude>
        <altitudeMode>relativeToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
          <coordinates>
          ${(xml.condinate).join('')}
          </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
            </Placemark>`
            )}
                </Document>
                </kml>
                `;

            return xml;
        }
    }
    /*--------------------------------------------end------------------*/
});

app.directive("splitmap", ['ngAuthSettings', 'msgSettings',
    function (ngAuthSettings, msgSettings) {
        return {
            restrict: "E",
            templateUrl: ngAuthSettings.ClientDirective + "/directive/shared/splitmap/template/splitmap.html",
            scope: {
                xml: "=",
                shapesuccess:"="
            },
            controller: 'splitmapController',
            link: function ($scope, $element, $attr) { }
        }

    }
]);
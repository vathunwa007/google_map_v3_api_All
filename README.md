# google_map_v3_api_All
เก็บapimap googlemap v3ที่ทำไว้


วิธีสำหรับ React cutom แบบ manual import สคริปในหน้าpublic
ใส่ใน <head>
          <script src='http://maps.google.com/maps/api/js?key=AIzaSyArK9veHmyKP3QdYMPW1381JzFHqUwDg9U&libraries=drawing,places,weekly&language=th&region=TH' defer></script> 0

ใส่หลัง <Body>
           <script src="/assets/js/wmsmaptype.js" async defer></script>                   1
          <script src="/assets/js/wms-capabilities.js"></script>                          2
          <script src="http://imis.md.go.th/lib/arcgislink.js" async defer></script>      3
          
          
-----------------------------------------------------------------------------------ฟังชั่นสำหรับหาจุดวาดที่ทับกันใน polygon-----------------------------------
1.ต้อง import lib           <script src="https://cdn.jsdelivr.net/gh/bjornharrtell/jsts@gh-pages/1.4.0/jsts.min.js" defer></script>
หรือ JSTS

2. เขียนฟังชั่นนี้ และ ตัวอย่างการเรียกใช้
           var googleMaps2JTS = function (boundaries) {
                        var coordinates = [];
                        for (var i = 0; i < boundaries.getLength(); i++) {
                            coordinates.push(new jsts.geom.Coordinate(
                                boundaries.getAt(i).lat(), boundaries.getAt(i).lng()));
                        }
                        coordinates.push(coordinates[0]);
                        // console.log(coordinates);
                        return coordinates;
                    };


                    var findSelfIntersects = function (googlePolygonPath) {
                        var coordinates = googleMaps2JTS(googlePolygonPath);
                        var geometryFactory = new jsts.geom.GeometryFactory();
                        var shell = geometryFactory.createLinearRing(coordinates);
                        var jstsPolygon = geometryFactory.createPolygon(shell);

                        // if the geometry is aleady a simple linear ring, do not
                        // try to find self intersection points.
                        var validator = new jsts.operation.IsSimpleOp(jstsPolygon);
                        if (validator.isSimpleLinearGeometry(jstsPolygon)) {
                            return;
                        }

                        var res = [];
                        var graph = new jsts.geomgraph.GeometryGraph(0, jstsPolygon);
                        var cat = new jsts.operation.valid.ConsistentAreaTester(graph);
                        var r = cat.isNodeConsistentArea();
                        if (!r) {
                            var pt = cat.getInvalidPoint();
                            res.push([pt.x, pt.y]);
                        }
                        return res;
                    };

                    var intersects = findSelfIntersects(path);
                    if (intersects && intersects.length) {
                        alert('มีจุดทับกัน');
                    } else {
                        alert('ไม่มีจุดที่ทับกัน');
                    }

          

# google_map_v3_api_All
เก็บapimap googlemap v3ที่ทำไว้


วิธีสำหรับ React cutom แบบ manual import สคริปในหน้าpublic
ใส่ใน <head>
          <script src='http://maps.google.com/maps/api/js?key=AIzaSyArK9veHmyKP3QdYMPW1381JzFHqUwDg9U&libraries=drawing,places,weekly&language=th&region=TH' defer></script> 0

ใส่หลัง <Body>
           <script src="/assets/js/wmsmaptype.js" async defer></script>                   1
          <script src="/assets/js/wms-capabilities.js"></script>                          2
          <script src="http://imis.md.go.th/lib/arcgislink.js" async defer></script>      3

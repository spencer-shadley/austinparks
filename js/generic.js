var currentPoolJson;
var map;

var app = angular.module('app', []);
app.controller('ctrl', function($scope, $http) {
    $http({
        method : "GET",
        url : "poolnames"
    }).then(function(res) {
        res.data.forEach(function(poolName) {
            $('#poolNameList').append(
                $('<li id="' + poolName + '">').append(
                    $('<button class="btn btn-link">').append(
                        poolName
                    ).click(function() {
                        setPool(poolName);
                    })
                )
            );
        });
    });

    function setPool(poolName) {
        console.log('set pool' + poolName);
        $http({
            method: "GET",
            url: "pooldata/" + poolName
        }).then(function(res) {

            // save data for later reference
            currentPoolJson = res.data;
            $scope.poolJson = res.data;

            // create marker for pool
            createMarker(currentPoolJson.location_1.latitude, currentPoolJson.location_1.longitude, currentPoolJson.pool_name);

            // format opening/closing hours based on availability
            var open_div = document.getElementById("status_open");
            var closed_div = document.getElementById("status_closed");
            if (currentPoolJson.status === "Closed") {
                closed_div.classList.remove("hidden");
                open_div.classList.add("hidden");
                currentPoolJson.open_date = new Date(currentPoolJson.open_date).toDateString();
            } else {
                open_div.classList.remove("hidden");
                closed_div.classList.add("hidden");
            }
        });
    }

    // map stuff
    function initMap() {
        var mapProp = {
            center: {lat: 30.3079827, lng: -97.8934848},
            zoom: 11,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map"), mapProp);
    }
    google.maps.event.addDomListener(window, 'load', initMap);

    function createMarker(latitude, longitude, infoData) {
        // create markers (pins)
        var marker = new google.maps.Marker({
            position: {lat: Number(latitude), lng: Number(longitude)},
            animation: google.maps.Animation.DROP
        });
        marker.setMap(map);

        var infoWindow = new google.maps.InfoWindow({
            content: infoData
        });
        marker.addListener('click', function() {
            infoWindow.open(map, marker);
            setPool(infoData);
        });
    }
});


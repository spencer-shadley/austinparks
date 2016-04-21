var currentPoolJson;
var map;
var selectedMarker;

var app = angular.module('app', []);
app.controller('ctrl', function($scope, $http) {
    $http({
        method : "GET",
        url : "poolcoords"
    }).then(function(res) {
        res.data.forEach(function(pool) {
            /*selectedMarker = */createMarker(pool.latitude, pool.longitude, pool.name);
            $('#poolNameList').append(
                $('<li id="' + pool.name + '">').append(
                    $('<button class="btn btn-link">').append(
                        pool.name
                    ).click(function() {
                        setPool(pool.name);
                        if(!($('#info').is(":visible"))) {    
                            $('#info').removeClass('hidden');

                            // Messy...
                            $('#map').removeClass('col-md-10').removeClass('col-lg-10');
                            $('#map').addClass('col-md-push-3').addClass('col-md-7').addClass('col-lg-7');
                            // initMap();
                        }
                    })
                )
            );
        });
    });

    function setPool(poolName) {
        $http({
            method: "GET",
            url: "pooldata/" + poolName
        }).then(function(res) {

            // save data for later reference
            currentPoolJson = res.data;
            $scope.poolJson = res.data;

            // create marker for pool
            //setMarker(currentPoolJson.location_1.latitude, currentPoolJson.location_1.longitude, currentPoolJson.pool_name);
            //selectedMarker = createMarker(currentPoolJson.location_1.latitude, currentPoolJson.location_1.longitude, currentPoolJson.pool_name);

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

    function initMap() {

        if (navigator.geolocation) navigator.geolocation.getCurrentPosition(updtPosition);

        var mapProp = {
            center: {lat: 30.3079827, lng: -97.8934848},
            zoom: 11,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map"), mapProp);
    }
    google.maps.event.addDomListener(window, 'load', initMap);

    function updtPosition(position) {
        var panPoint = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.panTo(panPoint);
    }

    /*function setMarker(givenMarker) {
        selectedMarker = new google.maps.Marker({
            position: {lat: Number(latitude), lng: Number(longitude)},
            animation: google.maps.Animation.DROP
        });
        marker.setMap(map);

        marker.addListener('click', function() {
            // setPool(infoData);
        });
    }*/

    function createMarker(latitude, longitude, infoData) {
        var marker = new google.maps.Marker({
            position: {lat: Number(latitude), lng: Number(longitude)},
            animation: google.maps.Animation.DROP
        });

        marker.setMap(map);
        marker.addListener('click', function() {
            selectedMarker = infoData;
            setPool(infoData);
        });
    }
});


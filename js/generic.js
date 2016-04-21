var currentPoolJson;
var map;
var selectedMarker;

var nameToMarker = {};

var app = angular.module('app', []);
app.controller('ctrl', function($scope, $http) {
    $http({
        method : "GET",
        url : "poolcoords"
    }).then(function(res) {
        res.data.forEach(function(pool) {
            nameToMarker[pool.name] = createMarker(pool.latitude, pool.longitude, pool.name);
            $('#poolNameList').append(
                $('<li id="' + pool.name + '">').append(
                    $('<button class="btn btn-link">').append(
                        pool.name
                    ).click(function() {
                        setPool(pool.name);
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

            if(selectedMarker) selectedMarker.setIcon('assets/icon-circle-10.png');
            var marker = nameToMarker[poolName];
            selectedMarker = marker;
            marker.setIcon('assets/pool-icon-50.png');

            if(!($('#info').is(":visible"))) {    
                $('#info').removeClass('hidden');

                // Messy...
                $('#map').removeClass('col-md-10').removeClass('col-lg-10');
                $('#map').addClass('col-md-push-3').addClass('col-md-7').addClass('col-lg-7');
                // initMap();
            }

            // save data for later reference
            currentPoolJson = res.data;
            $scope.poolJson = res.data;

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

    function createMarker(latitude, longitude, infoData) {
        var marker = new google.maps.Marker({
            position: {lat: Number(latitude), lng: Number(longitude)},
            animation: google.maps.Animation.DROP,
            icon: "assets/icon-circle-10.png"
        });

        marker.setMap(map);
        marker.addListener('click', function() {
            if(selectedMarker) selectedMarker.setIcon('assets/icon-circle-10.png');
            selectedMarker = marker;
            setPool(infoData);
            marker.setIcon("assets/pool-icon-50.png");

        });
        return marker;
    }
});


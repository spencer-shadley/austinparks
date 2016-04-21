var currentPoolJson;
var map;
var marker;
var infoWindow;

$(function(){
    $("#info").hide();
});

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
                        if(!($('#info').is(":visible"))) {    
                            $('#info').show();
                            
                            // $('#map').addClass('col-md-push-3');
                            // $('#map').switchClass('col-md-10', 'col-md-7', 5000);
                            // $('#map').switchClass('col-lg-10', 'col-lg-7', 5000);

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
            setMarker(currentPoolJson.location_1.latitude, currentPoolJson.location_1.longitude, currentPoolJson.pool_name);

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

    function setMarker(latitude, longitude, infoData) {
        // create markers (pins)
        if(marker) {
            var latlng = new google.maps.LatLng(latitude, longitude);
            marker.setPosition(latlng);
            marker.setAnimation(google.maps.Animation.DROP);
            infoWindow.setContent(infoData);
        } else {
            marker = new google.maps.Marker({
                position: {lat: Number(latitude), lng: Number(longitude)},
                animation: google.maps.Animation.DROP
            });
            infoWindow = new google.maps.InfoWindow({
                content: infoData
            });
        }
        marker.setMap(map);

        marker.addListener('click', function() { // TODO: use mouseover
            infoWindow.open(map, marker);
            // setPool(infoData);
        });
    }
});


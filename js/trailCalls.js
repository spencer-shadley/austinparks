var currentTrailJson;
var map;
var selectedMarker;
var getCenter;
var nameToMarker = {};

var app = angular.module('app', []);
app.controller('ctrl', function($scope, $http) {
    $http({
        method : "GET",
        url : "trailcoords"
    }).then(function(res) {
        res.data.forEach(function(trail) {
            nameToMarker[trail.name] = createMarker(trail.latitude, trail.longitude, trail.name);
            $('#trailNameList').append(
                $('<li id="' + trail.name + '">').append(
                    $('<button class="btn btn-link">').append(
                        trail.name
                    ).click(function() {
                        setTrail(trail.name);
                    })
                )
            );
        });
    });

    function setTrail(trailName) {
        $http({
            method: "GET",
            url: "traildata/" + trailName
        }).then(function(res) {

            if(selectedMarker) selectedMarker.setIcon('assets/icon-circle-15.png');
            var marker = nameToMarker[trailName];
            selectedMarker = marker;
            // marker.setAnimation(google.maps.Animation.DROP);
            marker.setIcon('assets/trail-icon-50.png');

            if(!($('#info').is(":visible"))) {    
                $('#info').removeClass('hidden');

                var mq = window.matchMedia( "(max-width: 991px)" );
                if (mq.matches) {
                    $('#info').css('height', '25%');
                    $('#map').css('height', '75%');
                }

                if (matchMedia) {
                    var mq = window.matchMedia("(min-width: 992px)");
                    mq.addListener(WidthChange);
                    WidthChange(mq);
                }

                // media query change
                function WidthChange(mq) {
                    if (mq.matches) {
                        // window width is at least 500px
                        $('#info').css('height', '100%');
                        $('#map').css('height', '100%');
                    } else {
                        // window width is less than 500px
                        $('#info').css('height', '25%');
                        $('#map').css('height', '75%');
                    }

                }

                // Messy...
                $('#map').removeClass('col-md-10').removeClass('col-lg-10');
                $('#map').addClass('col-md-push-3').addClass('col-md-7').addClass('col-lg-7');
                google.maps.event.trigger(map, "resize");
                map.setCenter(getCenter);
                // initMap();
            }

            // save data for later reference
            currentTrailJson = res.data;
            $scope.trailJson = res.data;

            // format opening/closing hours based on availability
            // var open_div = document.getElementById("status_open");
            // var closed_div = document.getElementById("status_closed");
            // if (currentTrailJson.status === "Closed") {
            //     closed_div.classList.remove("hidden");
            //     open_div.classList.add("hidden");
            //     currentTrailJson.open_date = new Date(currentTrailJson.open_date).toDateString();
            // } else {
            //     open_div.classList.remove("hidden");
            //     closed_div.classList.add("hidden");
            // }
        });
    }

    function initMap() {

        if (navigator.geolocation) navigator.geolocation.getCurrentPosition(updtPosition);

        var mapProp = {
            center: {lat: 30.297508, lng: -97.741448},
            zoom: 11,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map"), mapProp);
        getCenter = map.getCenter();
        map.data.loadGeoJson('trails.json');
        map.data.setStyle({
          strokeWeight: 3,
          strokeColor: '#ef443c'
        });
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
            icon: "assets/icon-circle-15.png"
        });

        marker.setMap(map);
        marker.addListener('click', function() {
            if(selectedMarker) selectedMarker.setIcon('assets/icon-circle-15.png');
            selectedMarker = marker;
            setTrail(infoData);
            marker.setIcon("assets/trail-icon-50.png");

        });
        return marker;
    }
});


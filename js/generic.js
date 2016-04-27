var currentPoolJson;
var map;
var selectedPool;
var getCenter;
var nameToMarker = {};

var app = angular.module('app', []);
app.controller('ctrl', function($scope, $http) {
    $http({
        method : "GET",
        url : "poolcoords"
    }).then(function(res) {
        res.data.forEach(function(pool) {
            nameToMarker[pool.name] = createMarker(pool.latitude, pool.longitude, pool.name, pool.status);
            $('#poolNameList').append(
                $('<li id="' + pool.name + '">').append(
                    $('<button class="btn btn-link">').append(
                        pool.name
                    ).click(function() {
                        setPool(pool.name, {
                            marker: nameToMarker[pool.name],
                            status: pool.status
                        });
                    })
                )
            );
        });
    });

    function setPool(poolName, pool) {
        $http({
            method: "GET",
            url: "pooldata/" + poolName
        }).then(function(res) {

            // update the last pool's icon
            if(selectedPool) selectedPool.marker.setIcon((selectedPool.status === 'Open') ? 'assets/icon-circle-green-15.png' : 'assets/icon-circle-15.png');

            // update the new pool's icon
            pool.marker.setIcon((pool.status === 'Open') ? 'assets/pool-icon-green-40.png' : 'assets/pool-icon-40.png');

            selectedPool = {
                marker: pool.marker,
                status: pool.status
            };

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

                $('#map').removeClass('col-md-10').removeClass('col-lg-10');
                $('#map').addClass('col-md-push-3').addClass('col-md-7').addClass('col-lg-7');
                google.maps.event.trigger(map, "resize");
                map.setCenter(getCenter);
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
            center: {lat: 30.297508, lng: -97.741448},
            zoom: 11,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map"), mapProp);
        getCenter = map.getCenter();
    }
    google.maps.event.addDomListener(window, 'load', initMap);

    function updtPosition(position) {
        var panPoint = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.panTo(panPoint);
    }

    function createMarker(latitude, longitude, name, status) {

        var marker = new google.maps.Marker({
            position: {lat: Number(latitude), lng: Number(longitude)},
            animation: google.maps.Animation.DROP,
            icon: (status === 'Open') ? 'assets/icon-circle-green-15.png' : 'assets/icon-circle-15.png'
        });

        marker.addListener('click', function() {
            setPool(name, {
                marker: marker,
                status: status
            });
        });
        marker.setMap(map);
        return marker;
    }
});

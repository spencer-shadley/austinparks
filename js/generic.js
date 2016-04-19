console.log('generic.js');

var currentPoolJson;

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
            currentPoolJson = res.data;
            $scope.poolJson = res.data;
            console.log(currentPoolJson);
            var open_div = document.getElementById("status_open");
            var closed_div = document.getElementById("status_closed");
            if (currentPoolJson.status === "Closed") {
                closed_div.classList.remove("hidden");
                open_div.classList.add("hidden");
                // Need to reformat date to a readable string
                var d = new Date(currentPoolJson.open_date).toDateString();
                currentPoolJson.open_date = d;
            } else {
                open_div.classList.remove("hidden");
                closed_div.classList.add("hidden");
            }
        });
    }

    // map stuff
    console.log('starting map stuff');
    function initMap() {
        console.log('started initMap');
    }
    function initialize() {
        var mapProp = {
            center:new google.maps.LatLng(51.508742,-0.120850),
            zoom:5,
            mapTypeId:google.maps.MapTypeId.ROADMAP
        };
        var map=new google.maps.Map(document.getElementById("map"),mapProp);
    }
    google.maps.event.addDomListener(window, 'load', initialize);
});


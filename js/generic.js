console.log('generic.js');

var app = angular.module('app', []);
app.controller('ctrl', function($scope, $http) {
    $http({
        method : "GET",
        url : "poolnames"
    }).then(function(res) {
        res.data.forEach(function(pool) {
            $('#poolNameList').append(
                $('<li id="' + pool + '">').append(
                    $('<button class="btn btn-link">').append(
                        pool
                    ).click(function() {
                        console.log(pool);
                    })
                )
            );
        });
    });
});
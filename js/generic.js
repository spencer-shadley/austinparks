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



    $scope.map = "asdflsdkfjsdlkfj";
    console.log('got here');

    function setPool(poolName) {
        console.log('set pool' + poolName);
        $http({
            method: "GET",
            url: "pooldata/" + poolName
        }).then(function(res) {
            currentPoolJson = res.data;
            $scope.poolJson = res.data;
            console.log(currentPoolJson);
            if (poolJson.status === "Closed") {
                
            }
        });
    }

});


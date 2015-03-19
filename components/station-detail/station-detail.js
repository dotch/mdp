angular.module('munichDepartures.stationDetail', [ 'ngMaterial' ])
  .controller('StationDetailController', [
    '$routeParams',
    StationDetailController
  ]);

function StationDetailController($routeParams) {
  console.log($routeParams);
}

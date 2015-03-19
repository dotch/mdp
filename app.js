angular.module('munichDepartures', [
  'ngMaterial',
  'munichDepartures.stationList',
  'munichDepartures.services'
])
  .config(function($mdThemingProvider, $mdIconProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('teal')
      .accentPalette('pink');
    });

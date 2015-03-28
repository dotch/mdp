angular
  .module('munichDepartures', [
    'ngNewRouter',
    'ngMaterial',
    'munichDepartures.stationDetail',
    'munichDepartures.stationList'
  ])
  .controller('AppController', ['$router', AppController])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('teal')
      .accentPalette('pink');
  });

function AppController($router) {
  $router.config([
    { path: '/'                     , redirectTo: '/stations'     },
    { path: '/stations'             , component:  'stationList'   },
    { path: '/stations/:stationName', component:  'stationDetail' }
  ]);
}

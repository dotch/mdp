angular.module('munichDepartures.stationDetail', ['ngMaterial'])
  .controller('StationDetailController', [
    '$routeParams',
    '$http',
    '$router',
    StationDetailController
  ]);

function StationDetailController($routeParams, $http, $router) {
  this.$http = $http;
  this.$routeParams = $routeParams;

  this.getListUrl = function() {
    return $router.generate('stationList');
  };
}

StationDetailController.prototype.activate = function() {
  var self = this;
  return self.$http.get('http://mvg.herokuapp.com/stations/' + self.$routeParams.stationName).then(function(response) {
    self.departures = response.data.departures.map(function(departure) {
      if (departure.line.indexOf('U') !== -1) {
        departure.type = 'ubahn';
      } else if (departure.line.indexOf('S') !== -1) {
        departure.type = 'sbahn';
      } else if (departure.line.indexOf('X') !== -1) {
        departure.type = 'xbus';
      } else if (departure.line.indexOf('N') !== -1) {
        departure.type = departure.line.slice(1) < 30 ? 'ntram' : 'nbus';
      } else {
        departure.type = departure.line < 30 ? 'tram' : 'bus';
      }
      return departure;
    }).sort(function(a, b) {
      // because the api gives sbahn results after all other results
      return a.timeRemaining - b.timeRemaining;
    });
    self.time = response.data.time;
    self.station = response.data.station;
  });
};
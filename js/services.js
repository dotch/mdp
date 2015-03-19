'use strict';

angular.module('munichDepartures.services', [])
  .factory('stationService', ['$http', stationService]);

function stationService($http){

  var stationFactory = {}

  stationFactory.all = function() {
    // TODO: load from locastorage or heroku
    return $http.get('http://mvg.herokuapp.com/stations').then(function (response) {
      return response.data;
    });
  }

  stationFactory.save = function() {
    // TODO
  }

  return stationFactory;
}

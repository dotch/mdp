angular.module('munichDepartures.stationList', [])
  .controller('StationListController', [
    '$http',
    '$window',
    // '$scope', // TODO: waiting for bugfix https://github.com/angular/router/issues/192
    StationListController
  ]);

function StationListController($http, $window, $scope) {
  var self = this;

  self.selected = null;
  self.stations = [];
  self.favorites = load('favorites') || [];
  self.toggleFavorite = toggleFavorite;
  self.nearby = [];
  self.nearbyCount = 6;
  self.getNearby = getNearby;
  self.useLocation = load('useLocation') || false;
  self.requestingLocation = false;
  self.locationSwitchChange = locationSwitchChange;
  self.$http = $http;

  function toggleFavorite(stationName) {
    var index = self.favorites.indexOf(stationName);
    if (index === -1) {
      self.favorites.push(stationName);
    } else {
      self.favorites.splice(index, 1);
    }
    save('favorites',self.favorites);
  }

  function save(key, object) {
    $window.localStorage.setItem(key, JSON.stringify(object));
  }

  function load(key) {
    return JSON.parse($window.localStorage.getItem(key));
  }

  function locationSwitchChange() {
    save('useLocation', self.useLocation);
    getNearby();
  }

  function getNearby() {
    if (self.useLocation) {
      self.requestingLocation = true;
      getLocation(function(lat, long) {
        getClosestStations(lat, long, function(nearbyStations) {
          self.nearby = [].concat(nearbyStations);
          self.requestingLocation = false;
          $scope.$apply();
        });
      })
    }
  }

  function getLocation(cb) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){
        cb(position.coords.latitude, position.coords.longitude);
      });
    }
  }

  function getClosestStations(lat, long, cb) {
    var closest = [];
    for (var i = 0; i < self.stations.length; i++) {
      var station = self.stations[i];
      var dist = getDistance(
        +station.lat,
        +station.long,
        lat,
        long);
      if (closest.length < self.nearbyCount || dist < closest[closest.length-1].distance) {
        closest.push({
          name: station.name,
          distance: dist.toFixed(2)
        });
        closest.sort(function(a,b) {
          return a.distance - b.distance;
        })
        if (closest.length > self.nearbyCount) closest.pop();
      }
    }
    cb(closest);
  }

  function getDistance(lat1,lon1,lat2,lon2) {
    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
  }

}

StationListController.prototype.activate = function() {
  var self = this;
  return this.$http.get('http://mvg.herokuapp.com/stations').then(function(response) {
    self.stations = response.data;
    self.getNearby();
    return self.stations;
  });
}

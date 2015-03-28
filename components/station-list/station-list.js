angular.module('munichDepartures.stationList', [])
  .controller('StationListController', [
    '$http',
    '$window',
    '$router',
    StationListController
  ]);

function StationListController($http, $window, $router) {

  this.stations = [];
  this.favorites = load('favorites') || [];
  this.nearby = [];
  this.nearbyCount = 6;
  this.useLocation = load('useLocation') || false;
  this.requestingLocation = false;
  this.$http = $http;
  this.$router = $router;

  this.toggleFavorite = function(station) {
    var stationName = getName(station);
    var index = this.favorites.indexOf(stationName);
    if (index === -1) {
      this.favorites.push(stationName);
    } else {
      this.favorites.splice(index, 1);
    }
    save('favorites', this.favorites);
  };

  this.isFavorite = function(station) {
    return this.favorites.indexOf(getName(station)) !== -1;
  };

  this.getDetailUrl = function(station) {
    return $router.generate('stationDetail', { stationName: getName(station)});
  };

  this.locationSwitchChange = function() {
    save('useLocation', this.useLocation);
    this.getNearby();
  };

  this.getNearby = function() {
    var self = this;
    if (self.useLocation) {
      self.requestingLocation = true;
      getLocation(function(lat, long) {
        getClosestStations(lat, long, self.stations, self.nearbyCount, function(nearbyStations) {
          self.nearby = [].concat(nearbyStations);
          self.requestingLocation = false;
          $scope.$apply();
        });
      });
    }
  };

  function save(key, object) {
    $window.localStorage.setItem(key, JSON.stringify(object));
  }

  function load(key) {
    return JSON.parse($window.localStorage.getItem(key));
  }

  function getName(station) {
    return angular.isString(station) ? station : station.name;
  }

  function getLocation(cb) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        cb(position.coords.latitude, position.coords.longitude);
      });
    }
  }

  function getClosestStations(lat, long, stations, count, cb) {
    var closest = [];
    for (var i = 0; i < stations.length; i++) {
      var station = stations[i];
      var dist = getDistance(+station.lat, +station.long, lat, long);
      if (closest.length < count || dist < closest[closest.length - 1].distance) {
        closest.push({
          name: station.name,
          distance: dist.toFixed(2)
        });
        closest.sort(function(a, b) {
          return a.distance - b.distance;
        });
        if (closest.length > count) closest.pop();
      }
    }
    cb(closest);
  }

  function getDistance(lat1, lon1, lat2, lon2) {
    function deg2rad(deg) {
      return deg * (Math.PI / 180);
    }
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
};

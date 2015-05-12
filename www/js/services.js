/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../../typings/angularjs/angular.d.ts"/>
/* global google */
angular.module('nomad.services', ['ngResource'])

.factory('Config', function(){
  return{
    apiBase: function(){
      //return 'http://damp-spire-4043.herokuapp.com'
      return 'http://192.168.0.14:3000';
    }
  };
})

.factory('Session', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    remove: function(key){
      if($window.localStorage[key]){
        delete $window.localStorage[key];
      }
    }
  }
})

.factory('Auth', function ($resource, Config) {
  var Auth = $resource(Config.apiBase()+'/auth/:path', {}, {
    login: {
      method: 'POST',
      params: {
        path: 'login'
      }
    }
  });

  return Auth;
})

.factory('Interest', function ($resource, Config) {
  var Interest = $resource(Config.apiBase()+'/interest', {}, {
    query: {
      method: 'GET',
      isArray: true
    }
  });

  return Interest;
})

.factory('Like', function ($resource, Config) {
  var Like = $resource(Config.apiBase()+'/like', {}, {
    query: {
      method: 'GET',
      isArray: true
    }
  });

  return Like;
})

.factory('User', function ($resource, Config) {
  var User = $resource(Config.apiBase()+'/user/:id/:path', {
    id: '@id'
  }, {
    update: {
      method: 'PUT'
    },
    saveInterests: {
      method: 'POST',
      params: {
        path: 'interest'
      }
    },
    saveLikes: {
      method: 'POST',
      params: {
        path: 'like'
      }
    },
    getTrips: {
      method: 'GET',
      params: {
        path: 'trip'
      },
      isArray: true
    },
    getFriendSuggestions: {
      method: 'GET',
      params: {
        path: 'friend'
      },
      isArray: true
    },
    inviteByEmail: {
      method: 'POST',
      params: {
        path: 'invite'
      }
    }
  });

  return User;
})

.factory('Place', function(){
  // This example retrieves autocomplete predictions programmatically
  // from the autocomplete service, and displays them as an HTML list.
  // The predictions will include a mix of places (as defined by the
  // Google Places API) and suggested search terms.

  var service;

  var Place = {
    getSuggestions: function(input, successCallback, errorCallback){
      if(!service){
        service = new google.maps.places.AutocompleteService();
      }

      // set a new promises array, set the types array
      var promises = [], types = ['(regions)', '(cities)'], result = [];

      // loop over the types and push the output of getPredications() for each one
      // into the promises array
      for (var i = 0, l = types.length; i < l; i++) {
        promises.push(getPredictions(types[i]));
      }

      // when all promises have completed then do something
      // This uses jQuery's when method which can take an array of
      // promises when used with apply
      $.when.apply(null, promises).then(function(){
        successCallback(result);
      });

      function getPredictions(type) {

        // Set up a new deferred object
        var deferred = new $.Deferred();

        // Call the asynchronous function to get the place predictions
        service.getPlacePredictions({
          input: input.term,
          types: [type],
          componentRestrictions: {
            country: 'in'
          }
        }, function (predictions, status) {

          //TODO: Handle error so that errorCallback is called when an error occurs
          if (status != google.maps.places.PlacesServiceStatus.OK) {
            return;
          }

          // Once the data has been returned perhaps do something with data
          if(!result){
            result = [];
          }

          result = result.concat(predictions);

          // Resolve the deferred object.
          deferred.resolve();
        });

        // return the promise
        return deferred.promise();
      }
    }
  };

  return Place;
})

.factory('Trip', function($resource, Config){
  var Trip = $resource(Config.apiBase()+'/trip/:id', {
    id: '@id'
  }, {
    get: {
      method: 'GET'
    },
    update: {
      method: 'PUT'
    },
    create: {
      method: 'POST'
    },
    log: {
      method: 'GET',
      isArray: true
    }
  });
  return Trip;
});

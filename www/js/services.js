angular.module('starter.services', ['ngResource'])

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

.factory('Auth', function ($resource) {
  var Auth = $resource('http://localhost:3000/auth/:path', {}, {
    login: {
      method: 'POST',
      params: {
        path: 'login'
      }
    }
  });

  return Auth;
})

.factory('Interest', function ($resource) {
  var Interest = $resource('http://localhost:3000/interest', {}, {
    query: {
      method: 'GET',
      isArray: true
    }
  });

  return Interest;
})

.factory('Like', function ($resource) {
  var Like = $resource('http://localhost:3000/like', {}, {
    query: {
      method: 'GET',
      isArray: true
    }
  });

  return Like;
})

.factory('User', function ($resource) {
  var User = $resource('http://localhost:3000/user/:id/:path', {
    id: '@id'
  }, {
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
    }
  });

  return User;
});
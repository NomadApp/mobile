angular.module('nomad.services', ['ngResource'])

.factory('Config', function(){
  return{
    apiBase: function(){
      return 'http://damp-spire-4043.herokuapp.com'
      return 'http://localhost:3000';
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
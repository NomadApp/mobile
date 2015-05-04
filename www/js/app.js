// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('nomad', ['ionic', 'nomad.controllers', 'nomad.services', 'nomad.interceptors'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  openFB.init({appId: '1036196223064784'});

  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('app.login', {
      url: "/login",
      views: {
        'menuContent': {
          templateUrl: "templates/login.html",
          controller: 'AppCtrl'
        }
      }
    })

    .state('app.interests', {
      url: "/interests",
      views: {
        'menuContent': {
          templateUrl: "templates/interests.html",
          controller: "InterestsCtrl"
        }
      }
    })

    .state('app.likes', {
      url: "/likes",
      views: {
        'menuContent': {
          templateUrl: "templates/likes.html",
          controller: "LikesCtrl"
        }
      }
    })

    .state('app.profile', {
      url: "/user/:id",
      views: {
        'menuContent' :{
          templateUrl: "templates/profile.html",
          controller: "ProfileCtrl"
        }
      }
    });

  var defaultState = '/app/login';
  if(window.localStorage.user){
    var user = JSON.parse(window.localStorage.user);
    defaultState = '/app/user/'+user.id;
  }
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise(defaultState);
});

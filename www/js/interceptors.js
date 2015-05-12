// interceptor to detect if the user has logged out
angular.module('nomad.interceptors', [])
  .config(function($httpProvider){
    $httpProvider.interceptors.push('errorInterceptor');
  })
  .factory('errorInterceptor', function($q) {
    return {
      // optional method
     'responseError': function(rejection) {
        if(rejection.status === 401){
          // instead of redirecting to mention, log out the user to clear cookie ~ chandan@liftoffllc.com
          console.log('logging out ' + rejection.status);
          if(window.localStorage['user']){
            delete window.localStorage['user'];
            window.location.href = window.location.origin+'/#/app/login';
          }
          return $q.reject(rejection);
        }else{
          return $q.reject(rejection);
        }
      }
    }
  });
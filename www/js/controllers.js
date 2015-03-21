angular.module('nomad.controllers', ['nomad.services'])

.controller('AppCtrl', function($scope, $timeout, $location, $state, Session, Auth) {
  $scope.logout = function(){
    Session.remove('user');
    $location.path('/login');
  };

  $scope.user = Session.getObject('user');

  $scope.fbLogin = function() {
    openFB.login(function(response) {
      if (response.status === 'connected') {
        console.log('Facebook login succeeded');
        $scope.loggingIn = true;
        Auth.login({facebookToken: response.authResponse.token}, function(data){
          $scope.loggingIn = false;
          Session.setObject('user', data);
          $scope.user = Session.getObject('user');
          if(data.firstLogin){
            $state.go('interests');
          }else{
            $state.go('app.profile');
          }
        }, function(error){
          $scope.loggingIn = false;
          alert(error.statusText + '. ' + error.data.message);
        });
      } else {
        alert('Facebook login failed');
      }
    },
    {scope: 'email,public_profile,user_friends'});
  };

})

.controller('ProfileCtrl', function($scope, Session) {
  $scope.user = Session.getObject('user');
})

.controller('InterestsCtrl', function($scope, $ionicLoading, $state, Session, User, Interest){
  $ionicLoading.show({
    template: 'Loading...'
  });

  $scope.loadingInterests = true;

  Interest.query(function(data){
    $scope.interests = data;
    $scope.loadingInterests = false;
    $ionicLoading.hide();
  }, function(error){
    $ionicLoading.hide();
    $scope.loadingInterests = false;
    alert(error.statusText+'. '+error.data.message);
  });

  $scope.save = function(){
    var checkedInterestIds = _.pluck(_.where($scope.interests, {checked: true}), 'id');
    $scope.savingInterests = true;
    User.saveInterests({
      id: Session.getObject('user').id,
      interestIds: checkedInterestIds
    }, function(data){
      $scope.savingInterests = false;
      $state.go('likes');
    }, function(error){
      $scope.savingInterests = false;
      alert(error.statusText+'. '+error.data.message);
      // This error does not justify holding the user in the page.
      // Advance the user to the next page anyways
      $state.go('likes');
    });
  };

})

.controller('LikesCtrl', function($scope, $ionicLoading, $state, Session, User, Like){
  $ionicLoading.show({
    template: 'Loading...'
  });

  $scope.loadingLikes = true;

  Like.query(function(data){
    $scope.likes = data;
    $scope.loadingLikes = false;
    $ionicLoading.hide();
  }, function(error){
    $ionicLoading.hide();
    $scope.loadingLikes = false;
    alert(error.statusText+'. '+error.data.message);
  });

  $scope.save = function(){
    var checkedLikeIds = _.pluck(_.where($scope.likes, {checked: true}), 'id');
    $scope.savingLikes = true;
    User.saveLikes({
      id: Session.getObject('user').id,
      likeIds: checkedLikeIds
    }, function(data){
      $scope.savingLikes = false;
      $state.go('app.profile');
    }, function(error){
      $scope.savingLikes = false;
      alert(error.statusText+'. '+error.data.message);
      // This error does not justify holding the user in the page.
      // Advance the user to the next page anyways
      $state.go('app.profile');
    });
  };

});

angular.module('nomad.controllers', ['nomad.services'])

.controller('AppCtrl', function($scope, $timeout, $location, $state, $ionicHistory, Session, Auth) {

  $scope.logout = function(){
    Session.remove('user');
    $state.go('app.login');
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

          $ionicHistory.nextViewOptions({
            disableBack: true
          });

          if(data.firstLogin){
            $state.go('app.interests');
          }else{
            $state.go('app.profile', {
              id: $scope.user.id
            });
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

.controller('ProfileCtrl', function($scope, $ionicModal, $stateParams, $ionicLoading, Session, User) {
  $scope.user = new User(Session.getObject('user'));
  $scope.newBio = {
    text: ''
  };
  $ionicLoading.show({
    template: 'Loading...'
  });

  var user; // Used for profile updates

  User.get({
    id: $stateParams.id
  }, function(data){
    $ionicLoading.hide();
    $scope.profileUser = data;
    user = data;
    // Refresh session user after each visit to the profile page
    Session.setObject('user', data);
  }, function(error){
    $ionicLoading.hide();
    alert(error.statusText+'. '+error.data.message);
  });

  $scope.openEditBioModal = function(){
    if(!$scope.bioModal){
      $ionicModal.fromTemplateUrl('templates/edit-bio-modal.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true,
        hardwareBackButtonClose: true
      }).then(function(modal) {
        $scope.bioModal = modal;
        $scope.newBio.text = $scope.profileUser.bio ? String($scope.profileUser.bio) : '';
        $scope.bioModal.show();
      });
    }else{
      $scope.bioModal.show();
    }
  };

  $scope.getBioModalTitlePrefix = function(){
    return $scope.profileUser.bio ? 'Edit ' : 'Add ';
  };

  $scope.saveBio = function(){
    user.bio = $scope.newBio.text;

    $ionicLoading.show({
      template: 'Loading...'
    });

    User.update(user, function(data){
      $scope.profileUser = data;
      Session.setObject('user', data);
      $ionicLoading.hide();
      $scope.bioModal.hide();
    }, function(error){
      $ionicLoading.hide();
      $scope.bioModal.hide()
      alert(error.statusText+'. '+error.data.message);
    });
  };
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
      $state.go('app.likes');
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
    var userId = Session.getObject('user').id;
    User.saveLikes({
      id: userId,
      likeIds: checkedLikeIds
    }, function(data){
      $scope.savingLikes = false;
      $state.go('app.profile', {
        id: $scope.user.id
      });
    }, function(error){
      $scope.savingLikes = false;
      alert(error.statusText+'. '+error.data.message);
      // This error does not justify holding the user in the page.
      // Advance the user to the next page anyways
      $state.go('app.profile', {
        id: $scope.user.id
      });
    });
  };

});

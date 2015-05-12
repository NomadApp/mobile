angular.module('nomad.controllers', ['nomad.services'])

.controller('AppCtrl', function($scope, $timeout, $location, $state, $ionicHistory, Session, Auth) {

  $scope.logout = function(){
    Session.remove('user');
    $state.go('app.login');
  };

  $scope.gotoTab = function(stateId){
    $state.go('app.'+stateId);
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
      $state.go('app.likes');
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
        id: userId
      });
    }, function(error){
      $scope.savingLikes = false;
      alert(error.statusText+'. '+error.data.message);
      // This error does not justify holding the user in the page.
      // Advance the user to the next page anyways
      $state.go('app.profile', {
        id: userId
      });
    });
  };

})

.controller('MyTripsCtrl', function($scope, $ionicLoading, $ionicHistory, $state, User, Session){
  var user = Session.getObject('user');

  $ionicLoading.show({
    template: 'Loading...'
  });

  User.getTrips({id: user.id}, function(data){
    $scope.trips = data;
    $ionicLoading.hide();
  }, function(error){
    $ionicLoading.hide();
    alert(error.statusText+'. '+error.data.message);
  });

})

.controller('CreateTripCtrl', function($scope, $location, $ionicModal, $timeout, $ionicLoading, $state, $ionicHistory,
  Place, Trip, Session, User){
  
  var user = Session.getObject('user');
  
  if(!$state.is('app.createTripStep1')){
    $ionicLoading.show({
      template: 'Creating Trip...'
    });
    Trip.get({
      id: $state.params.tripId
    }, function(data){
      $scope.trip = data;
      $ionicLoading.hide();
    }, function(error){
      $ionicLoading.hide();
      alert(error.statusText + '. ' + error.data.message);
    });
  }else{
    $scope.trip = {
      owner: user.id
    };
  }
  var user = Session.getObject('user');

  $scope.suggestions = [];

  var queryStringParameters = $location.search();
  if(queryStringParameters.trip){
    $scope.trip = JSON.parse(queryStringParameters.trip);
  }

  function suggestionSuccess(predictions){
    $timeout(function(){
      if(predictions && predictions.length){
        $scope.suggestions = predictions;
      }else{
        $scope.suggestions = [];
      }
    }, 10);
  }

  function suggestionError(error){
    alert(error);
  }

  $scope.createTrip = function(){
    $ionicLoading.show({
      template: 'Crateing Trip...'
    });
    Trip.create($scope.trip, function(data){
      $scope.trip = data;
      $ionicLoading.hide();
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('app.tripLocation', {
        tripId: $scope.trip.id
      });
    }, function(error){
      $ionicLoading.hide();
      alert(error.statusText + '. ' + error.data.message);
    });
  };

  $scope.saveTripLocation = function(){
    $ionicLoading.show({
      template: 'Saving location...'
    });
    Trip.update($scope.trip, function(data){
      $ionicLoading.hide();
      $state.go('app.tripDates', {
        tripId: $scope.trip.id
      });
    }, function(error){
      $ionicLoading.hide();
      alert(error.statusText + '. ' + error.data.message);
    });
  };

  $scope.saveTripDates = function(){
    $ionicLoading.show({
      template: 'Saving dates...'
    });
    Trip.update($scope.trip, function(data){
      $ionicLoading.hide();
      $state.go('app.tripMembers', {
        tripId: $scope.trip.id
      });
    }, function(error){
      $ionicLoading.hide();
      alert(error.statusText + '. ' + error.data.message);
    });
  };

  $scope.openLocationModal = function(type){
    $scope.modalType = type;
    $scope.suggestions = [];

    $ionicModal.fromTemplateUrl('templates/location-modal.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true,
      hardwareBackButtonClose: true
    }).then(function(modal) {
      $scope.locationModal = modal;

      var locationValue;
      if(type === 'start' && $scope.trip.startLocation){
        locationValue = _.clone($scope.trip.startLocation.description);
      }else if(type === 'end' && $scope.trip.endLocation){
        locationValue = _.clone($scope.trip.endLocation.description);
      }
      $scope.location = {
        value: locationValue
      };
      $scope.locationModal.show();
    });

  };

  $scope.getLocationModalTitle = function(){
    return ($scope.modalType && $scope.modalType === 'start' ? 'Start Location' : 'Destination');
  };

  $scope.selectSuggestion = function(){
    $scope.location.value = this.suggestion.description;
    this.suggestion.checked = true;
    $scope.closeLocationModal();
  };

  $scope.getSuggestions = function(){
    return $scope.suggestions;
  };

  $scope.suggestLocations = function(coordinates){
    var params = {
      term: $scope.location.value
    };

    Place.getSuggestions(params, suggestionSuccess, suggestionError);
  };

  $scope.closeLocationModal = function(){
    $scope.trip[$scope.modalType+'Location'] = _.findWhere($scope.suggestions, {checked: true});
    $scope.locationModal.hide();
  };

  $scope.search = {
    term: ''
  };

  $scope.suggestFriends = function(){
    $scope.suggestions = [];
    $ionicLoading.show({
      template: 'Loading...'
    });
    User.getFriendSuggestions({
      term: $scope.search.term,
      id: user.id
    }, function(data){
      $scope.suggestions = data;
      $ionicLoading.hide();
    }, function(error){
      $ionicLoading.hide();
      alert(error.statusText + '. ' + error.data.message);
    });
  };

  $scope.openEmailInviteModal = function(){
    $ionicModal.fromTemplateUrl('templates/email-invite.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true,
      hardwareBackButtonClose: true
    }).then(function(modal) {
      $scope.emailInviteModal = modal;
      $scope.email = {
        value: ''
      };
      $scope.emailInviteModal.show();
    });
  };

  $scope.sendInvite = function(){
    $ionicLoading.show({
      template: 'Sending invite'
    });
    var email = $scope.email.value; 
    User.inviteByEmail({
      email: email,
      id: user.id,
      trip: $scope.trip
    }, function(data){
      $ionicLoading.hide();
      $scope.emailInviteModal.hide();
      if(!$scope.members){
        $scope.members = [];
      }
      $scope.members.push({
        emailOnly: true,
        email: email
      });
    }, function(error){
      $ionicLoading.hide();
      alert(error.statusText + '. ' + error.data.message);
    });
  };

})

.controller('FeedCtrl', function($scope){

});


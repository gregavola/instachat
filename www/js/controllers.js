angular.module('starter.controllers', [])

.controller('FriendsCtrl', function($scope, ParseService, $location, PushNotes) {

	// Push Notifications
	//PushNotes.register();

	$scope.onlineContacts = [];
	$scope.offlineContacts = [];
	$scope.finishedLoading = false;

	$scope.doRefresh = function() {
		ParseService.getContactList(
			function results(res) {

				$scope.onlineContacts = [];
				$scope.offlineContacts = [];

				for(i = 0; i < res.length; i++) {
					var item = res[i];
					if (item.attributes.user.attributes.user_state == 1) {
						$scope.isOnlineContacts = true;
						$scope.onlineContacts.push(item);
					} else {
						$scope.isOfflineContacts = true;
						$scope.offlineContacts.push(item);
					}
				}

				console.log($scope.onlineContacts);

				$scope.$apply();
				$scope.$broadcast('scroll.refreshComplete');
			},
			function fail() {
				console.log('fail');
				$scope.$broadcast('scroll.refreshComplete');
			}
		)
	}

  	ParseService.currentUser(
  		function win(currentUser) {

  			// Update Online Status
  			ParseService.changeStatus(
  				{"user_state": 1},
  				function success(result) {
  					console.log(result);
  				},
  				function fail(result) {
  					console.log('fail');
  				}
  			)

  			ParseService.getContactList(
  				function results(res) {

  					for(i = 0; i < res.length; i++) {
  						var item = res[i];
  						if (item.attributes.user.attributes.user_state == 1) {
  							$scope.isOnlineContacts = true;
  							$scope.onlineContacts.push(item);
  						} else {
  							$scope.isOfflineContacts = true;
  							$scope.offlineContacts.push(item);
  						}
  					}

  					console.log($scope.onlineContacts);

					$scope.finishedLoading = true;

  					$scope.$apply();
  				},
  				function fail(err) {
  					console.log('fail');
  				}
  			)
  		}, 
  		function fail(error) {
  			$location.path("/tab/login");
  		}
  	)
})

.controller('ThreadDetailCtrl', function($scope, $stateParams, ParseService, $location, $ionicLoading, PusherTrigger, Pusher, $ionicScrollDelegate, UtilFunctions) {

	var tabs = document.querySelectorAll('div.tabs')[0];
	tabs = angular.element(tabs);
	tabs.css('display', 'none');

	$scope.$on('$destroy', function() {
		console.log('HideCtrl destroy');
		tabs.css('display', '');
	});


    var threadId = $stateParams.threadId;
    var userId = $stateParams.targetId;

    var _isCurrentlyTyping = false;
    var _hasSentTypingMessage = false;
    var _hasSentStopMessage = false;
    var searchTimeout;


	$ionicLoading.show({
      template: 'Loading Thread...'
    });

    $scope.gotScrolled = function() {
    	if (cordova.plugins.Keyboard.isVisible) {
    		cordova.plugins.Keyboard.close();
    	}
    }

	Pusher.subscribe(threadId, 'new_message', function (item) {
	    // an item was updated. find it in our list and update it.
	     ParseService.currentUser(
			function win(currentUser) {
			    if (angular.element(document.querySelector("#message_"+item.message_id)).length == 0 && item.user.objectId != currentUser.id) {

			    	var newObj = {
		    			"createdAt": item.message_payload.createdAt,
		    			"attributes": {
		    				"message": item.message,
		    				"user": {
		    					"attributes": item.user
		    				}
		    			}
		    		}
			    	

			    	console.log(newObj);

					$scope.messages.push(newObj);
					$ionicScrollDelegate.scrollBottom();
				}
			}
		);

	    console.log("NEW MESSAGE");
	    console.log(item);
	});


    ParseService.getThread(
    	{"thread_id": threadId},
    	function results(res) {
    		$ionicLoading.hide();
    		if (res.length == 0) {
    			$scope.messages = [];
    		} else {
    			$scope.messages = res;
    		}

    		ParseService.getUser({id:userId},
				function win(user) {
					$scope.user = user.attributes;
					$scope.$apply();
				},
				function fail(user) {

				}
    		);

    		$ionicScrollDelegate.scrollBottom();
    	},
    	function fail(error) {
    		$ionicLoading.hide();
    		console.log(error);
    	}
    );

    $scope.doRefresh = function() {
    	var skip = document.querySelectorAll(".messages").length;
    	ParseService.getThread(
	    	{"thread_id": threadId, "offset": skip},
	    	function results(res) {
	    		if (res.length == 0) {
	    			
	    		} else {
	    			console.log($scope.messages);
	    			for(i = 0; i < res.length; i++) {
	    				$scope.messages.unshift(res[i]);
	    			}
	    		
	    			console.log($scope.messages);
	    		}

	    		$scope.$broadcast('scroll.refreshComplete');
	    	},
	    	function fail(error) {
	    		$ionicLoading.hide();
	    		$scope.$broadcast('scroll.refreshComplete');
	    	}
	    );
    }

    $scope.saveMessage = function(content) {
		$ionicLoading.show({
	      template: 'Posting Message...'
	    });

	    ParseService.currentUser(
			function win(currentUser) {
				console.log(currentUser)
				var messageObj = {
					"thread_id": threadId,
					"user": currentUser,
					"message": content.text
				}

				console.log(messageObj);

				ParseService.postMessage(messageObj,
					function successPost(results) {
						$ionicLoading.hide();
						console.log(results);
						$scope.messages.push(results);

						var obj = {
							url: "PHP SCRIPT TO POST TO PUSHER",
							data: {
								message: {
									"message": results.attributes.message,
									"user": currentUser,
									"messagea_id": results.id,
									"message_payload": results
								},
								event: "new_message",
								channel: threadId
							},
							method: "POST"
						};

						console.log(obj);

						PusherTrigger.triggerEvent(obj, 
							function results(res, status) {
								console.log("-- Good ---");
								console.log(res)
							},
							function fail(res, status) {
								console.log('Fail');
								console.log(res);
							}
						)

						setTimeout(function() {
							$ionicScrollDelegate.scrollBottom();
							document.querySelector("#commentBox").value = "";
							$scope.$apply();
						}, 100)
					

					},
					function errorPost(error) {
						$ionicLoading.hide();
						console.log('error post');
						var obj = {
							title: "Oh no!",
							template: "We were unable to post your comment. Please try again."
						};

						UtilFunctions.setAlert(obj);
					}
				)
	    	},
	    	function fail(error) {
	    		console.log('fail on currentuser');
	    	}
	    )
	}

})

.controller('AccountCtrl', function($scope, $location, $state, ParseService, $ionicLoading, $ionicViewService) {

	$scope.logOut = function() {

		$ionicViewService.nextViewOptions({
		  disableBack: true
		});

		$ionicLoading.show({
	      template: 'Logging Out...'
	    });

		// Update Online Status
		ParseService.changeStatus(
			{"user_state": 0},
			function success(result) {
				console.log(result);
				Parse.User.logOut();
				var currentUser = Parse.User.current();
				var _currentCheck;

				_currentCheck = setInterval(function() {
					if (currentUser == null) {
						clearInterval(_currentCheck);
						$ionicLoading.hide();
						$location.path("/tab/login");
						console.log("done");
					}
				}, 500);
				
			},
			function fail(result) {
				console.log('fail');
			}
		)
	}
})

.controller('RegisterCtrl', function($scope, ParseService, $location, $ionicLoading, UtilFunctions) {
	
	var tabs = document.querySelectorAll('div.tabs')[0];
	tabs = angular.element(tabs);
	tabs.css('display', 'none');

	$scope.$on('$destroy', function() {
		console.log('HideCtrl destroy');
		tabs.css('display', '');
	});

	$scope.signUp = function(user) {

		$ionicLoading.show({
	      template: 'Loading...'
	    });

		ParseService.register(user,
			function success() {
				$ionicLoading.hide();
				$location.path("/tab/friends");
			},
			function error(user, error) {
				$ionicLoading.hide();

				var obj = {
					title: "Oh no!",
					template: "We had a problem signing you up. Please try again. " + error
				};

				UtilFunctions.setAlert(obj);
				console.log(error);
			}
		);
	}
})

.controller('LoginCtrl', function($scope, $location, ParseService, $ionicLoading, UtilFunctions) {

	var tabs = document.querySelectorAll('div.tabs')[0];
	tabs = angular.element(tabs);
	tabs.css('display', 'none');

	$scope.$on('$destroy', function() {
		console.log('HideCtrl destroy');
		tabs.css('display', '');
	});

	$scope.login = function(user) {
		
		$ionicLoading.show({
	      template: 'Loading...'
	    });

		ParseService.signIn(user,
			function success() {
				$ionicLoading.hide();
				$location.path("/tab/friends");
			},
			function error(user, error) {
				$ionicLoading.hide();

				var obj = {
					title: "Oh no!",
					template: "Your username and/or pasword is incorrect. Please try again."
				};

				UtilFunctions.setAlert(obj);
				console.log(error);
			}
		)
	}

	$scope.signUp = function() {
		$location.path("/tab/signup");
	}
});

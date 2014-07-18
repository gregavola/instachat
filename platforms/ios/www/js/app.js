// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'doowb.angular-pusher', 'ui.gravatar', 'angular-moment'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(['PusherServiceProvider',
  function(PusherServiceProvider) {
    PusherServiceProvider
      .setToken('XXXXXX')
      .setOptions({});
  }
])

.config(function($stateProvider, $urlRouterProvider) {

  // init Parse
  Parse.initialize("XXXXXXXXX", "XXXXXXXX");

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.friends', {
      url: '/friends',
      views: {
        'tab-friends': {
          templateUrl: 'templates/tab-friends.html',
          controller: 'FriendsCtrl'
        }
      }
    })
    .state('tab.friend-detail', {
      url: '/thread/:threadId/:targetId',
      views: {
        'tab-friends': {
          templateUrl: 'templates/thread-detail.html',
          controller: 'ThreadDetailCtrl'
        }
      }
    })

    .state('tab.account', {
      url: '/account',
      views: {
        'tab-account': {
          templateUrl: 'templates/tab-account.html',
          controller: 'AccountCtrl'
        }
      }
    })

     .state('tab.login', {
      url: '/login',
      views: {
        'tab-account': {
          templateUrl: 'templates/log-in-template.html',
          controller: 'LoginCtrl'
        }
      }
    })

    .state('tab.signup', {
      url: '/signup',
      views: {
        'tab-account': {
          templateUrl: 'templates/register-template.html',
          controller: 'RegisterCtrl'
        }
      }
    })

    var currentUser = Parse.User.current();
    if (currentUser) {
      $urlRouterProvider.otherwise('/tab/friends');
    } else {
      $urlRouterProvider.otherwise('/tab/login');
    }
});

var onNotificationAPN = function(e) {
  if (e.pushType == "message") {
    $location.path("/thread/"+e.threadId+"/"+e.targetId)
  }
}

var tokenHandler = function(result) {
    var currentUser = Parse.User.current();
    if (currentUser) {
      console.log(obj);
      var user = Parse.User.current();

      user.set("push_token", result);
      user.save(null, {
        success: function(user) {
          
        },
        error: function(user, error) {
          
        }
      });
    }
}
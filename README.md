instchat
=====================

A sample probject using Cordova/Phonegap and Ionic to build a real-time chat program for iOS (also for Android)

## Requirements

1. Parse Account (http://parse.com)
2. Pusher Account (http://pusher.com)
3. Server side scripting language (in the example I used PHP), to post your messages to Pusher
4. Ionic (```npm install -g ionic``` - this is optional for live-reload)
5. Cordova (```npm install -g cordova``` - required if you want to build a native app)

## Using this project

All files are set up in the www/ directory. You will need to change a few things:

1. In ```app.js``` you will need to add your client and secret keys for Parse online 35
2. In ```app.js`` you will need to add your Pusher Token on line 28
3. In ```controllers.js``` you will need to add the relative path of your server side scripting lanuage that will post the message to Pusher. An example of this has been placed in ```pusher_server_php```, which is a PHP example. Open up ```trigger.php``` and add your Pusher Token on line 14 to replace the "XXXXX".

If you have Ionic install via NPM, you can run:

```ionic serve```

via the command line to have a live-reload server to test via your browser.

## Building Native with Cordova

To build natively with Cordova (aka. Phonegap), you need to go to the root directory of the project, and type in you terminal:

```cordova build ios```

This will compile all your code in the ```www``` directory over to ```platforms/ios/www```. After this is done, you can run:

```cordova emulate ios```

or you can simplely navigate to ```platforms/ios``` and open the ```xproj``` file in Xcode and run the app there. Anytime you make a change in your ```www``` directory, you need to run ```cordova build ios``` to synch it to the ```platforms/ios``` directory.

## Issues
If you have any issues let me know on Twitter at @<a href="http://twitter.com/gregavola">gregavola.


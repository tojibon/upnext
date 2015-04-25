(function() {

	'use strict';

	window.ServiceHelpers = window.ServiceHelpers || {};

    window.ServiceHelpers.appendTransform = function appendTransform(defaults, transform) {

        // We can't guarantee that the default transformation is an array
        defaults = angular.isArray(defaults) ? defaults : [defaults];

        // Append the new transformation to the defaults
        return defaults.concat(transform);
    };

    // Generate unique IDs for use as pseudo-private/protected names.
    // Similar in concept to
    // <http://wiki.ecmascript.org/doku.php?id=strawman:names>.
    //
    // The goals of this function are twofold:
    // 
    // * Provide a way to generate a string guaranteed to be unique when compared
    //   to other strings generated by this function.
    // * Make the string complex enough that it is highly unlikely to be
    //   accidentally duplicated by hand (this is key if you're using `ID`
    //   as a private/protected name on an object).
    //
    // Use:
    //
    //     var privateName = ID();
    //     var o = { 'public': 'foo' };
    //     o[privateName] = 'bar';
    window.ServiceHelpers.ID = function() {
    	// Math.random should be unique because of its seeding algorithm.
		// Convert it to base 36 (numbers + letters), and grab the first 9 characters
		// after the decimal.
		return '_' + Math.random().toString(36).substr(2, 9);
    }

	var soundCloudify = angular.module('soundCloudify', ['ngMaterial', 'ngRoute', 'ui.router', 'react', 'indexedDB']);

    soundCloudify.value('API_ENDPOINT', 'http://52.11.108.36');

	soundCloudify.value('CLIENT_ID', '849e84ac5f7843ce1cbc0e004ae4fb69');

	soundCloudify.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider, 
                                    $compileProvider, $httpProvider, $indexedDBProvider) {

			$stateProvider
				.state('nowPlaying', {
					url: "/now-playing",
					templateUrl: "partials/nowPlaying.html",
					controller: 'NowPlayingController',
					controllerAs: 'vm'
				})
				.state('search', {
					url: "/search",
					templateUrl: "partials/search.html",
					controller: 'SearchController'
				})
				//===============================================
				// PLAYLIST
				//===============================================
				.state('playlist', {
					abstract: true,
					url: "/playlist",
					templateUrl: "partials/playlist/playlist.html",
					controller: 'PlaylistController',
					controllerAs: 'playlistCtrl'
				})
					.state('playlist.list', {
						url: "",
						templateUrl: "partials/playlist/list.html"
					})
					.state('playlist.view', {
						url: "/:playlistIndex",
						templateUrl: "partials/playlist/view.html",
						controller: 'PlaylistViewController',
						controllerAs: 'playlistViewCtrl'
					})
				//===============================================
				// CHARTS
				//===============================================
				.state('charts', {
					abstract: true,
					url: "/charts",
					templateUrl: "partials/charts/charts.html",
					controller: 'ChartsController',
					controllerAs: 'chartsCtrl'
				})
					.state('charts.list', {
						url: "",
						templateUrl: "partials/charts/list.html"
					})
					.state('charts.detail', {
						url: "/:category",
						templateUrl: "partials/charts/view.html",
						controller: 'ChartsViewController',
						controllerAs: 'viewCtrl'
					});

			$urlRouterProvider.otherwise("/charts");

			$mdThemingProvider.definePalette('amazingPaletteName', {
				'50': 'ffebee',
				'100': 'ffcdd2',
				'200': 'ef9a9a',
				'300': 'e57373',
				'400': 'ef5350',
				'500': 'f44336',
				'600': 'e53935',
				'700': 'd32f2f',
				'800': 'c62828',
				'900': 'b71c1c',
				'A100': 'ff8a80',
				'A200': 'ff5252',
				'A400': 'ff1744',
				'A700': 'd50000',
				'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
				                                	// on this palette should be dark or light
				'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
					'200', '300', '400', 'A100'],
				'contrastLightColors': undefined    // could also specify this if default was 'dark'
			});

			$mdThemingProvider.theme('default')
			    .primaryPalette('light-green').dark();

			$compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);

			$httpProvider.interceptors.push('HttpRequestInterceptor');

            $indexedDBProvider
                .connection('soundcloudify')
                .upgradeDatabase(1, function(event, db, tx){
                    var playlistStore = db.createObjectStore('playlist', {keyPath: 'id'});
                    var nowplayingStore = db.createObjectStore('nowplaying', {keyPath: 'uuid'});
                });

			//TODO: reenable it in production
			$compileProvider.debugInfoEnabled(false);
		}
	);

	soundCloudify.run(function($rootScope, GATracker, $location, UserService, SyncService) {
		$rootScope.$on('$stateChangeSuccess', function(event) {
			GATracker.trackPageView($location.path());
		});

		UserService.init();

		SyncService.init();
	});

	angular.element(document).ready(function() {
		//angular.bootstrap(document, ["soundCloudify"]);
	    setTimeout(function() { angular.bootstrap(document, ["soundCloudify"]); }, 100);
	});

}());

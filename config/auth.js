// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '1464862063762583', // your App ID
		'clientSecret' 	: '89cad4df276fce7b9be9137f1cd460b1', // your App Secret
		'callbackURL' 	: 'http://homeguard2.mybluemix.net/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: '2v0KJNd77dciY6sigVs0sQD6P',
		'consumerSecret' 	: 'qYNE4BuQFkr9CdxrwWUTqoxebK7jiynC2Jy0KO26jpgimIOGHE',
		'callbackURL' 		: 'http://homeguard2.mybluemix.net/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: '906215644488-9a2qauvjmhggi8cu6r0tto9ic1ga5mf3.apps.googleusercontent.com',
		'clientSecret' 	: 'IcAAUiv9JXx2zY1eSZ_xzCEa',
		'callbackURL' 	: 'http://homeguard2.mybluemix.net/auth/google/callback'
	}

};
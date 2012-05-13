module.exports = {

	// The bot's name
	name: 'AwesomeBot',
	
	// The auth token used to authenticated with ttfm. It's saved in your cookies.
	auth: 'auth+live+1234567890abcdef1234567890abcdef12345678',
	
	// Userid to log in with
	userid: '1234567890abcdef12345678',
	
	// Roomid to autojoin
	roomid: '1234567890abcdef12345678',
	
	// Array of modules to load automatically
	autoload: [
		'admin',
		'pm'
	],
	
	// Something used by modules a lot...
	specialUsers: {
		'chrisinajar': '4e42c21b4fe7d02e6107b1ff'
	},
	
	// How long before we bust out the :boot: when idleboot is enabled.
	// Defaults to 30 minutes
	// idleBoot: (1000*60*30)
};
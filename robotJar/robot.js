'use strict';

var User = function(userid, name) {
	this.userid = userid;
	this.name = name;
	this.idleTimer = (new Date()).getTime();
	j.userNames[name] = userid;
}
User.prototype.getIdleTime = function() {
	return ((new Date()).getTime() - this.idleTimer);
}

var j = {
	bot: null,
	util: null,
	room: null,
	users: {},
	userNames: {},
	specialUsers: {
		'docawk': '4e1b661a4fe7d0314a05b6cb',
		'cheep': '4dfff25ba3f75104e306e495',
	},
	settings: {
		'users': function() {
			for(var id in j.users) for (var func in User.prototype)
				j.users[id][func]=User.prototype[func];
		}, 
		'userNames': null,
	},
	loadSettings: function() {
		for (var obj in j.settings) {
			this.db.get(obj, function(er, doc) {
				if (er) {
					if (er.reason == "missing") {
						j.log("No setting found for: " + obj);
						return;
					}
					throw new Error(JSON.stringify(er));
				}
				j.log("Loaded setting: " + doc._id);
				j[doc._id]=doc;
				if (j.settings[doc._id])
					j.settings[doc._id]();
			});
		}
	},
	saveSettings: function(h) {
		var c = 0;
		for (var obj in j.settings) {
			c++;
			this.db.save(obj, j[obj], function(er, doc) {
				if (er) throw new Error(JSON.stringify(er));
				j.log(doc);
				j.log("Saved setting: " + doc.id);
				if (--c == 0) {
					h();
				}
			});
		}
	},
	term: {
		clearLine: function() { return '\u001b[0G'+'\u001b[2K';},
		end: function() { return '\u001b[99G';},
		down: function() { return '\u001b[E';},
		up: function() { return '\u001b[F';},
		save: function() { return '\u001b[s';},
		restore: function() { return '\u001b[u';},
	},
	color: {
		red: function(m) { return '\u001b[31m'+m+j.color.reset();},
		green: function(m) { return '\u001b[32m'+m+j.color.reset();},
		blue: function(m) { return '\u001b[34m'+m+j.color.reset();},
		reset: function(){return '\u001b[0m';}
	},
	'public': {},
	log: function(msg) {
		j.rl.pause();
		process.stdout.write(j.term.clearLine());
		console.log(msg);
		j.rl.prompt();
		//process.stdout.write(j.term.end());
		j.rl.resume();
	},
	
	onLoad: function(util, bot, room) {
		var cradle = require('cradle');
		var http = require('http');
		this.db = new(cradle.Connection)().database('robojar');
		this.loadSettings();
		this.util = util;
		this.bot = bot;
		this.public.bot = bot;
		bot.on('roomChanged',  function(data) {
			for (var user in data.users) {
				user = data.users[user];
				if (typeof j.users[user.userid] == "undefined")
					j.users[user.userid] = new User(user.userid, user.name);
			}
			this.room = data.room;
		});
		bot.roomRegister(room);
	},
	onUnload: function() {
		j.log("Dick.");
	},
	unload: function() {
		j.saveSettings(function(){
			j.log("Over and out.");
			process.exit();
		});
	},
	onSpeak: function(d) {
		if (typeof j.users[d.userid] == "undefined") {
			j.users[d.userid] = new User(d.userid, d.name);
		} else j.users[d.userid].idleTimer = (new Date()).getTime();
		if (typeof j.userNames[d.name] == "undefined") {
			j.userNames[d.name] = d.userid;
		}
		if (d.text.substr(0,1) == "/") {
			if (d.text == "/djs") {
				j.log(j.color.red(d.name + " ran " + d.text));
				// check if doc awk is in da house
				var msg = '';
				if (typeof j.users[j.specialUsers.docawk] == "undefined") {
					j.bot.roomInfo(j.room, function(data) {
						for (var dj in data.room.metadata.djs) {
							dj = data.room.metadata.djs[dj];
							if (typeof j.users[dj] != "undefined") {
								var user = j.users[dj];
								var idle = Math.floor(user.getIdleTime()/1000);
								if (idle < 30)
									return;
								var timeStr = Math.floor(idle/60)+':'+(idle%60);
								if (timeStr.substr(-2,1) == ":") {
									timeStr = timeStr.substr(0, timeStr.length-1) + '0' + timeStr.substr(-1);
								}
								msg += user.name + ': ' + timeStr + ' :: ';
							} else {
								msg += user.name + ': magic? :: ';
							}
						}
						if (msg.length == 0)
							j.bot.speak("No one is idle.");
						else
							j.bot.speak('Idle: ' + msg);
					});
				}
				return;
			}
		}
		j.log(j.color.blue(d.name)+": "+d.text);
	},
	onUserJoin: function(d) {
		for (var user in d.user) {
			user = d.user[user];
			j.users[user.userid] = new User(user.userid, user.name);
			j.log(j.color.green(user.name+' has joined'));
		}
	},
	onUserPart: function(d) {
		for (var user in d.user) {
			user = d.user[user];
			j.log(j.color.red(user.name+' has left'));
			delete j.users[user.userid];
		}
	},
	onVote: function() {
	},
	onNewSong: function(d) {
		setTimeout(function(){
			j.bot.vote('up');
		}, (15*Math.random())+10);
		
		var song = d.room.metadata.current_song;
		var data = {
			roomName: d.room.name,
			roomID: d.room.roomid,
			roomURL: d.room.roomid,
			playedBy: song.djname,
			songArtist: song.metadata.artist,
			songName: song.metadata.song,
			secretID: 'auugnsogb92nflac825nwapbps94n2e3',
		};
		var options = {
		  host: 'songtracker.vladimirkozyrev.com',
		  port: 80,
		  path: '/songPlayed?'
		};
		for (var d in data) {
			options.path += d+'='+encodeURIComponent(data[d]);
		}
		options.path = options.path.substr(0, options.path.length-1);

		require('http').request(options, function(res) {
		  j.log("Got response: " + res.statusCode);
		  j.log(res);
		  j.res=res;
		}).on('error', function(e) {
		  j.log("Got error: " + e.message);
		}).on('data', function(chunk) {
		  j.log(chunk);
		});
	},

	onCommand: function(msg) {
		if (msg == "undefined" || msg.length < 1) {
			j.rl.prompt();
			return;
		}
		if (msg.substr(0,2) == "j:") {
			setTimeout(function(){
				try {
					j.log(eval(msg));
				} catch(e) {
					j.util.puts(e.stack);
				}
				j.rl.prompt();
			},0);
		} else if (msg.substr(0,1) == "/") {
			msg = msg.substr(1).split(' ');
			switch(msg[0]) {
				case "djs":
					j.bot.roomInfo(j.room, function(data) {for (var dj in data.room.metadata.djs) {
							dj = data.room.metadata.djs[dj];
							if (typeof j.users[dj] != "undefined") {
								var user = j.users[dj];
								var idle = Math.floor(user.getIdleTime()/1000);
								if (idle < 30)
									return;
								var timeStr = Math.floor(idle/60)+':'+(idle%60);
								if (timeStr.substr(-2,1) == ":") {
									timeStr = timeStr.substr(0, timeStr.length-1) + '0' + timeStr.substr(-1);
								}
								console.log(j.color.blue(user.name) + ' '+timeStr);
							}
						}
					});
					//j.log
					break;
				case "close":
					j.unload();
					break;
			}
		} else {
			j.bot.speak(msg);
		}
	}
};



module.exports.roboJar = j;

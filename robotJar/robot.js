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
	spamCount: 0,
	users: {},
	userNames: {},
	songStats: {success: false},
	lang: {
		get: function(type) {
			var ar = j.lang[type];
			return ar[Math.round(Math.random()*(ar.length-1))];
		},
		overloaded: [
			"STOP STRESSING ME OUT.",
			"I'M BEING ANTI-SOCIAL.",
			"WHY CAN'T YOU PEOPLE JUST LEAVE ME ALONE.",
			"CATFACTS OVERLOAD. CANNOT COMPUTE.",
			"brb",
		],
	},
	specialUsers: {
		'docawk': '4e1b661a4fe7d0314a05b6cb',
		'cheep': '4dfff25ba3f75104e306e495',
	},
	admin: function(id, c, d) {
		if (id == '4e42c21b4fe7d02e6107b1ff')
			c(d);
		j.bot.roomInfo(j.room, function(d) {
			if (d.room.metadata.moderator_id.indexOf(id) >= 0)
				c(d);
		});
	},
	settings: {
		'users': {
			load: function() {
				for(var id in j.users) for (var func in User.prototype)
					j.users[id][func]=User.prototype[func];
			}, 
		},
		'userNames': {},
	},
	loadSettings: function(h, context) {
		if (!j.isset(context))
			context = j;
		var c = 0;
		for (var obj in context.settings) {
			c++;
			j.getDoc(obj, function(obj, doc) {
				context[obj]=doc;
				if (j.isset(context.settings[obj].load))
					context.settings[obj].load();
				if (--c == 0 && j.isset(h)) {
					h();
				}
			}, obj);
		}
	},
	saveSettings: function(h, context) {
		if (!j.isset(context))
			context = j;
		var c = 0;
		for (var obj in context.settings) {
			c++;
			j.putDoc(obj, context[obj], function(obj, doc) {
				if (j.isset(context.settings[obj].save))
					context.settings[obj].save();
				if (--c == 0 && j.isset(h)) {
					h();
				}
			}, obj);
		}
	},
	getDoc: function(name, h, d) {
		this.db.get(name, function(er, doc) {
			if (er) {
				if (er.reason == "missing") {
					j.log("No setting found for: " + name);
				}
				j.log(er);
			}
			j.log("Loaded setting: " + name);
			h(d, doc);
		});
	},
	putDoc: function(name, obj, h, d) {
		this.db.save(name, obj, function(er, doc) {
			if (er) j.log(er);
			j.log("Saved setting: " + name);
			h(d, doc);
		});
	},
	term: {
		clearLine: function() { return '\u001b[0G'+'\u001b[2K';},
		end: function() { return '\u001bG';},
		down: function() { return '\u001b[E';},
		up: function() { return '\u001b[F';},
		save: function() { return '\u001b[s';},
		restore: function() { return '\u001b[u';},
	},
	color: {
		red: function(m) { return '\u001b[31m'+m+j.color.reset();},
		green: function(m) { return '\u001b[32m'+m+j.color.reset();},
		yellow: function(m) { return '\u001b[33m'+m+j.color.reset();},
		blue: function(m) { return '\u001b[34m'+m+j.color.reset();},
		reset: function(){return '\u001b[0m';}
	},
	'public': {},
	log: function(msg) {
		j.rl.pause();
		var cpos = j.rl.cursor;
		//process.stdout.write(j.term.save());
		process.stdout.write(j.term.clearLine());
		console.log(msg);
		j.rl.prompt();
		if (j.rl.output.cursorTo)
			j.rl.output.cursorTo('roboJar> '.length + cpos);
		j.rl.cursor = cpos;
		//j.rl.cursorTo(cpos);
		//process.stdout.write(j.term.end());
		//process.stdout.write(j.term.restore());
		j.rl.resume();
	},
	unregister: function(obj, event, cb, rm) {
		var ar = j.on.ar[obj.id];
		if (!j.isset(ar))
			return;
		if (!j.isset(rm))
			rm = 0;
		else if (rm > 0)
			rm--;
		j.log("Looking for object with id: " + obj.id);
		for (var i=rm; i<ar.length; ++i) {
			var me = ar[i];
			if (j.isset(event) && me.event != event)
				continue;
			if (j.isset(cb) && me.callback != cb)
				continue;
			
			event = me.event;
			cb = me.callback;
			
			var p = j.on.ids[event].indexOf(me.id);
			j.log(p+' '+me.id);
			j.log(j.on.events[event]);
			j.log(j.on.ids[event]);
			j.on.events[event].splice(p,1);
			j.on.ids[event].splice(p,1);
			ar.splice(i,1);
			i--;
		}
		delete j.on.ar[obj.id];
	},
	on: function(obj, event, cb) {
		if (!j.isset(j.on.ar[obj.id]))
			j.on.ar[obj.id] = [];
		if (!j.isset(j.on.events[event]))
			j.on.events[event] = [];
		if (!j.isset(j.on.ids[event]))
			j.on.ids[event] = [];
		
		var id=(Math.random()*0xefffffffffffffff + 0x1000000000000000).toString(16);
		
		j.on.ids[event].push(id);
		j.on.events[event].push(cb);
		j.on.ar[obj.id].push({
			object: obj,
			event: event,
			callback: cb,
			id: id,
		});
	},
	dispatch: function(event, data) {
		j.log('Event: '+event);
		if (!j.isset(j.on.events[event]))
			return;
		var ar = j.on.events[event];
		for (var i=0,l=ar.length; i<l; ++i) {
			(function(cb, d) {
				setTimeout(function(){
					try {
						cb(d);
					} catch (e) {
						j.log(e);
					}
				},0);
			})(ar[i],data);
		}
	},
	modules: {},
	loadModule: function(name, h, d) {
		j.unloadModule(name, function(d) {
			var Type = require('./'+name);
			Type.prototype.id = (Math.random()*0xefffffffffffffff + 0x1000000000000000).toString(16);
			Type.prototype.loadSettings = function(){};
			j.modules[name] = new Type(j);
			j.log('Loaded module: ' + name);
			if (j.isset(h)) h(d);
		}, d);
	},
	unloadModule: function(name, h, d) {
		if (!j.isset(j.modules[name])) {
			if (j.isset(h)) h(d);
			return;
		}
		j.unregister(j.modules[name]);
		j.modules[name].unload(function(name) {
			delete j.modules[name];
			delete require.cache[require.resolve('./'+name).id];
			if (j.isset(h)) h(d);
		}, name);
	},
	onLoad: function(util, bot, room) {
		var cradle = require('cradle');
		var http = require('http');
		j.db = new(cradle.Connection)().database('robojar');
		j.loadSettings();
		j.util = util;
		j.bot = bot;
		j.public.bot = bot;
		
		j.on.ar = {};
		j.on.ids = {};
		j.on.events = {};
		
		var events = [
			'speak',
			'newsong',
			'registered',
			'deregistered',
		];
		for (var i=0,l=events.length; i<l; ++i) {
			var event = events[i];
			j.bot.on(event, function(d){
				j.dispatch(d.command, d);
			});
		}
		
		j.on(this, 'speak', j.onSpeak);
		j.on(this, 'newsong', j.onNewSong);
		j.on(this, 'registered', j.onUserJoin);
		j.on(this, 'deregistered', j.onUserPart);
		j.on(this, 'roomChanged', function(data) {
			var djs = [];
			for (var user in data.users) {
				user = data.users[user];
				djs.push(user.userid);
				if (typeof j.users[user.userid] == "undefined")
					j.users[user.userid] = new User(user.userid, user.name);
			}
			for (var user in j.users) {
				if (user.length < 24)
					continue;
				if (djs.indexOf(user) < 0) {
					j.log('Purging stale user: ' + user);
					delete j.users[user]
				}
			}
			j.room = data.room;
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
	checkSpam: function() {
		j.log("checking spam "+j.spamCount);
		if (j.spamCount > 5)
			return true;
		setTimeout(function(){j.spamCount--;},10000);
		if (++j.spamCount > 3) {
			j.bot.speak(j.lang.get('overloaded'));
			return true;
		}
		return false;
	},
	onSpeak: function(d) {
		if (!j.isset(j.users[d.userid])) {
			j.users[d.userid] = new User(d.userid, d.name);
		} else j.users[d.userid].idleTimer = (new Date()).getTime();
		if (j.isset(j.userNames[d.name])) {
			j.userNames[d.name] = d.userid;
		}
		if (d.text.substr(0,1) == "/") {
			var tcmd = d.text.split(' ');
			var cmd = [];
			for (var i in tcmd) {
				if (tcmd[i].length > 0)
					cmd.push(tcmd[i]);
			}
			if (cmd[0] == "/djs" && cmd.length == 1) {
				if (j.checkSpam())
					return;
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
								if (idle < 300)
									continue;
								if (idle > 600)
									msg += '@';
								var timeStr = Math.floor(idle/60)+':'+(idle%60);
								if (timeStr.substr(-2,1) == ":") {
									timeStr = timeStr.substr(0, timeStr.length-1) + '0' + timeStr.substr(-1);
								}
								msg += user.name + ': ' + timeStr + ' || ';
							} else {
								msg += '@'+user.name + ': magic? || ';
							}
						}
						if (msg.length == 0)
							j.bot.speak("No one is idle.");
						else
							j.bot.speak('Idle: ' + msg.substr(0,msg.length-3));
					});
				}
				return;
			} else if (cmd[0] == "/songinfo") {
				if (j.checkSpam())
					return;
				j.log(j.color.red(d.name + " ran " + d.text));
				if (!j.songStats.success) {
					j.bot.speak("Shhhhhhh.");
					return;
				}
				var msg='';
				if (j.songStats.timesPlayed > 0) {
					msg += "Played "+j.songStats.timesPlayed+" times before.";
					msg += " Last played: Where's Strng?";
					var lp = j.songStats.lastPlayedTime
				} else {
					msg+= "First time played.";
				}
				j.bot.speak(msg);
				//*
			} else if (cmd[0] == "/roll") {
				if (j.checkSpam())
					return;
				j.log(j.color.red(d.name + " ran " + d.text));
				switch(cmd.length) {
					case 3:
						if (isNaN(cmd[1]) || isNaN(cmd[2])) {
							j.bot.speak("Numbers are hard. Beep boop.");
							return;
						}
						j.roll(cmd[1],cmd[2]);
						break;
					case 2:
						if (isNaN(cmd[1])) {
							j.bot.speak("Numbers are hard. Beep boop.");
							return;
						}
						j.roll(1,cmd[1]);
						break;
					case 1:
						j.roll(1,100);
						break;
				}
			} else if (cmd[0] == "/eval") { j.admin(d.userid, function(cmd) {
				var torun = '';
				for(var i=1, l=cmd.length;i<l;++i) {
					torun += cmd[i] + ' ';
				}
				setTimeout(function() {
					try {
						eval(torun);
					} catch(e) {
						j.bot.speak("nope.avi: " + e.message);
					}
				}, 0);
				//*/
			}, cmd);
			}else if (cmd[0] == "/barrelroll") {
				j.bot.speak("I can't let you do that.");
			} else if (cmd[0] == "/load") { j.admin(d.userid, function(cmd) {
				setTimeout(function() {
					try {
						j.loadModule(cmd[1]);
						j.bot.speak("Loaded module: "+cmd[1]);
					} catch(e) {
						j.bot.speak("nope.avi: " + e.message);
					}
				}, 0);
			}, cmd);
			} else if (cmd[0] == "/unload") { j.admin(d.userid, function(cmd) {
				setTimeout(function() {
					try {
						j.unloadModule(cmd[1], function(n) {
							j.bot.speak("Unloaded module: "+n);
						}, cmd[1]);
					} catch(e) {
						j.bot.speak("nope.avi: " + e.message);
					}
				}, 0);
			}, cmd);
			}
		}
		j.log(j.color.blue(d.name)+": "+d.text);
	},
	roll: function(min, max) {
		min = parseInt(min);
		max = parseInt(max);
		var result = Math.round(Math.random()*(max-min))+min;
		j.bot.speak('Rolled '+min+' to '+max+' and got: '+result);
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
		var song = d.room.metadata.current_song;
		j.log(j.color.yellow('New Song\nDj: '+song.djname+'\nSong: '+song.metadata.song+'\nArtist: '+song.metadata.artist));
		setTimeout(function(){
			j.bot.vote('up');
		}, (15*Math.random())+10);
		
		
		//return;
		// fuck this code
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
		  path: '/songPlayed/?',
		};
		for (var d in data) {
			options.path += d+'='+encodeURIComponent(data[d])+'&';
		}
		options.path = options.path.substr(0, options.path.length-1);

		var chunks = [];
		require('http').get(options, function(res) {
			j.log("Got response: " + res.statusCode);
			j.res=res;
			res.on('data', function(chunk) {
				chunks.push(chunk);
			}).on('end', function() {
				var size = 0;
				for (var i = 0, l = chunks.length; i<l;++i) {
					size += chunks[i].length;
				}
				var buffer = new Buffer(size);
				size = 0;
				for (var i = 0, l = chunks.length; i<l;++i) {
					chunks[i].copy(buffer, size);
					size += chunks[i].length;
				}
				j.song = song;
				j.songStats = JSON.parse(buffer.toString());
				if (!j.songStats.success) {
					j.log("Failed to submit song stats");
					j.log(j.songStats);
				}
			});
		}).on('error', function(e) {
		  j.log("Got error: " + e.message);
		});
	},

	onCommand: function(msg) {
		if (msg == "undefined" || msg.length < 1) {
			j.rl.prompt(true);
			return;
		}
		if (msg.substr(0,2) == "j:") {
			setTimeout(function(){
				try {
					j.log(eval(msg));
				} catch(e) {
					j.util.puts(e.stack);
				}
				j.rl.prompt(true);
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
				case "load":
					try {
						j.loadModule(msg[1]);
					} catch(e) {
						j.log("nope.avi: " + e.message);
					}
					break;
				case "unload":
					try {
						j.loadModule(msg[1]);
					} catch(e) {
						j.log("nope.avi: " + e.message);
					}
					break;
				case "close":
					j.unload();
					break;
			}
		} else {
			j.bot.speak(msg);
		}
	},
	isset: function(d) {
		return (typeof d != "undefined")
	},
	id: "roboJar eats children",
};



module.exports.roboJar = j;
module.exports.User = User;

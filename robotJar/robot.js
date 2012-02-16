'use strict';

var j = {
	bot: null,
	util: null,
	users: {},
	color: {
		red: function(m) { return '\u001b[31m'+m+j.color.reset();},
		blue: function(m) { return '\u001b[34m'+m+j.color.reset();},
		reset: function(){return '\u001b[0m';}
	},
	'public': {},
	log: function(msg) {
		process.stdout.write("\n");
		console.log(msg);
		process.stdout.write("roboJar> ");
	},
	onLoad: function(util, bot, room) {
		this.util = util;
		this.bot = bot;
		this.public.bot = bot;
		bot.roomRegister(room);
	},
	onUnload: function() {
		j.log("Oh, ok, bye.");
	},
	onSpeak: function(d) {
		j.log(j.color.blue(d.name)+": "+d.text);
		if (typeof j.users[d.name] == "undefined") {
			j.users[d.name] = {
				name: d.name,
				userid: d.userid,
				idleTimer: (new Date()).getTime(),
				getIdleTime: function() {
					return ((new Date()).getTime() - this.idleTimer)/1000;
				}
			};
		} else j.users[d.name].idleTimer = (new Date()).getTime();
	},
	onUserJoin: function() {
	},
	onVote: function() {
	},
	onNewSong: function() {
		setTimeout(function(){
			j.bot.vote('up');
		}, (15*Math.random())+10)
	},

	onCommand: function(msg) {
		msg=msg.substr(1,msg.length-3);
		if (msg == "undefined") {
			process.stdout.write("roboJar> ");
			return;
		}
		if (msg.substr(0,2) == "j:") {
			setTimeout(function(){
				try {
					j.log(eval(msg));
				} catch(e) {
					j.util.puts(e.stack);
				}
				process.stdout.write("\nroboJar> ");
			},0);
		} else if (msg.substr(0,1) == "/") {
			msg = msg.substr(1).split(' ');
			switch(msg[0]) {
				case "djs":
					j.bot.roomInfo('4ded3b7e99968e1d29000047', function(data) {
						for (dj in data.room.metadata.djs) {
							
						}
					});
					//j.log
					break;
			}
		} else {
			j.bot.speak(msg);
		}
	}
};



module.exports.roboJar = j;

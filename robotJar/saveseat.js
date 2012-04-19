/*
 * roboJar: A turntable.fm bot. Chris "inajar" Vickery <chrisinajar@gmail.com>
 *
 * Redistribution and use in source, minified, binary, or any other forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name, roboJar, nor the names of its contributors may be 
 *    used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * Needs more cat facts.
 *
 */

var SaveSeat = function (j) {
	var self = this;
	self.j = j;
	self.save = null;

	j.on(this, 'speak', function(d, j) {
		self.handle(j.speak, d);
	}, j);
	
	j.on(this, 'pmmed', function(d, j) {
		j.bot.getProfile(d.senderid, function(profile) {
			d.userid = d.senderid;
			d.name = profile.name;
			self.handle(function(msg) {
				j.bot.pm(msg, d.senderid);
			}, d);
		});
	}, j);
	
	self.handle = function(d) {
		if (d.text.substr(0,1) != "/")
			return;
			
		var tcmd = d.text.split(' ');
		var cmd = [];
		for (var i in tcmd) {
			if (tcmd[i].length > 0)
				cmd.push(tcmd[i]);
		}
		var j = s.j;
		if (cmd[0] != "/saveseat") {
			j.bot.roomInfo(j.room, function(data) {
				if (s.save != null && s.save != d.userid) {
					j.speak("Sorry, I can only save one seat at a time");
				}
				if (data.room.metadata.djs.indexOf(d.userid) < 0)
					return;
				
				s.saveSeat(d.userid);
			});
		}
	};
	self.saveSeat = function(id) {
		var j = this.j;
		if (this.save != null && this.save != id) {
			j.speak("A seat is already being saved, hang on");
			return
		}
		this.save = id;
		j.bot.speak("Alright, your seat is saved for the next 1 minute.");
		if (this.timerId) {
			clearTimeout(this.timerId);
			delete this.timerId;
		}
		(function(s){
			s.timerId = setTimeout(s.unsave, 60000);
		})(this);
	}

};
SaveSeat.prototype.unload = function(h, d) {
	h(d);
}
SaveSeat.prototype.unsave = function() {
	if (this.timerId) {
		clearTimeout(this.timerId);
		delete this.timerId;
	}
	j.bot.speak("Seat is no longer saved");
	this.save = null;
}

module.exports = SaveSeat;
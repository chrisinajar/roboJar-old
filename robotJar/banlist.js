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


var BanList = function(j) {
	var self = this;
	self.j = j;
	self.banlist = {};
	
	j.getDoc('banlist', function(s, doc) {
		if (doc)
			self.banlist = doc;
	});
	
	//j.on(this, 'speak', function(d, j) {
	//	self.handle(j.speak, d);
	//}, j);
	
	j.on(this, 'registered', function(d, j) {
		for (var i = 0; i < d.user.length; ++i) {
			var userid = d.user[i].userid;
			// check for ban!
			if (userid in self.banlist) {
				j.bot.getProfile(self.banlist[userid], function(d){
					j.bot.boot(userid, "You have been banned by: " + d.name);
				});
				//j.bot.boot(userid);
			}
		}
	}, j);
	
	j.on(this, 'pmmed', function(d, j) {
		j.admin(d.senderid, function() {
			d.userid = d.senderid;
			self.handle(function(msg) {
				j.bot.pm(msg, d.senderid);
			}, d);
		});
	}, j);
	
	self.handle = function(reply, d) {
		if (d.text.substr(0,1) != "/")
			return;
			
		var tcmd = d.text.split(' ');
		var cmd = [];
		for (var i in tcmd) {
			if (tcmd[i].length > 0)
				cmd.push(tcmd[i]);
		}
		if (cmd.length < 1)
			return;
		var user="";
		var userid=null;
		var senderName = d.name;
		for (var i = 1; i < cmd.length; ++i)
			user += cmd[i]+(i+1 === cmd.length?"":" ");

		if (user in j.userNames) {
			userid = j.userNames[user];
		} else {
			userid = user;
		}
		j.log(cmd[0]);
		if (cmd[0] == "/ban") {
			if (userid.length != 24)
				return reply('Failed to find user!');
			if (userid in self.banlist)
				return reply('User is already banned');
			else
				reply('User has been banned!');
			self.banlist[userid] = d.userid;
		} else if (cmd[0] == "/unban") {
			if (userid in self.banlist)
				reply('Unbanned');
			else
				return reply('Not banned!');
			delete self.banlist[userid];
		}
	};
};

BanList.prototype.unload = function(c,d) {
	var self = this;
	var j = this.j;

	j.putDoc('banlist', self.banlist, c, d);
};

module.exports = BanList;

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


var Admin = function(j) {
	var self = this;
	this.fun = true;
	this.j = j;
	this.timerId = null;
	
	j.on(this, 'speak', function(d, j) {
		self.handle(j.speak, d);
	}, j);
	
	j.on(this, 'pmmed', function(d, j) {
		self.handle(function(msg) {
			j.bot.pm(msg, d.senderid);
		}, d);
	}, j);
	
	self.checkSpam = function() {
		j.log("checking spam "+j.spamCount);
		if (j.spamCount > 5)
			return true;
		setTimeout(function(){j.spamCount--;},10000);
		if (++j.spamCount > 3) {
			j.bot.speak(j.lang.get('overloaded'));
			return true;
		}
		return false;
	}
	self.handle = function(reply, d) {
		if (d.text.substr(0,1) != "/")
			return;
			
		var tcmd = d.text.split(' ');
		var cmd = [];
		for (var i in tcmd) {
			if (tcmd[i].length > 0)
				cmd.push(tcmd[i]);
		}
		if (cmd[0] == "/eval") {
			j.log(j.color.red(d.name + " ran " + d.text));
			j.log(cmd);
			var torun = '';
			for(var i=1, l=cmd.length;i<l;++i) {
				torun += cmd[i] + ' ';
			}
			j.log("Executing: " + j.color.red(torun));
			setTimeout(function() {
				j.run(torun, true);
			}, 0);
			//*/
		} else if (cmd[0] == "/load") {
			setTimeout(function() {
				j.run(function() {
					j.loadModule(cmd[1]);
					reply("Loaded module: "+cmd[1]);
				}, true);
			}, 0);
		} else if (cmd[0] == "/unload") {
			setTimeout(function() {
				j.run(function() {
					j.unloadModule(cmd[1], function(n) {
						reply("Unloaded module: "+n);
					}, cmd[1]);
				}, true);
			}, 0);
		}
	};
};

Admin.prototype.unload = function(c,d){c(d);}

module.exports = Admin;


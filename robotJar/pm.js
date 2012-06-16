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


var PrivateMessages = function(j) {
	var self = this,
		bot = j.bot,
		oldpm = j.bot.pm;

	j.on(this, 'pmmed', function(d, j) {
		var text = d.text;
		j.bot.getProfile(d.senderid, function(d) {
			if (j.users[d.userid])
				j.admin(d.userid, function() {
					j.users[d.userid].idleTimer = (new Date()).getTime();
				});
			j.log(' '+j.color.cyan(d.name)+'> '+text);
		});
	}, j);

	bot.pm = function(msg) {
		j.log(' '+j.color.cyan('roboJar')+'> '+msg);
		oldpm.apply(bot, arguments);
	}

	self.unload = function(c,d) {
		c(d);
	}
}

module.exports = PrivateMessages;
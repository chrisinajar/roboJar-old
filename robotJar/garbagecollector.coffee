#
# roboJar: A turntable.fm bot. Chris "inajar" Vickery <chrisinajar@gmail.com>
#
# Redistribution and use in source, minified, binary, or any other forms, with or without
# modification, are permitted provided that the following conditions are met:
#  * Redistributions of source code must retain the above copyright
#    notice, this list of conditions and the following disclaimer.
#  * Redistributions in binary form must reproduce the above copyright
#    notice, this list of conditions and the following disclaimer in the
#    documentation and/or other materials provided with the distribution.
#  * Neither the name, roboJar, nor the names of its contributors may be 
#    used to endorse or promote products derived from this software without
#    specific prior written permission.
#
# Needs more cat facts.
#
#


class GarbageCollector
	constructor: (@j)->
		j = @j
		@timeid = setInterval(@checkIdleUsers, 10000)
		@timers = []
		@recycling = 0

		j.on this, 'booted_user', (d)=>
			@cancel(d.userid)

		j.on this, 'deregistered', (d)=>
			@cancel(d.userid)
		
		j.on this, 'speak', (d)=>
			@cancel(d.userid, true)

		j.on this, 'pmmed', (d)=>
			@cancel(d.senderid, true)

	checkIdleUsers: =>
		j = @j
		idlers = []
		count = 0
		checkIdle = (userid)=>
			if (!j.users[userid])
				return

			idle = j.users[userid].getNetIdleTime?()

			if (!idle)
				return
			count++
			if (idle > (4*60*60*1000))
				idlers.push userid
		checkIdle userid for userid of j.users

		if ((count - @recycling) > 190)
			@recycling++
			@recycle(idlers)

	cancel: (userid, good)->
		if (@timers[userid])
			clearTimeout @timers[userid]
			delete @timers[userid]
			if (good)
				@j.bot.pm('/monocle', userid)
			@recycling--

	recycle: (idlers)=>
		j = @j	
		userid = idlers[Math.round(Math.random()*(idlers.length-1))]
		for i in [0...10] when ((!j.users[userid]) || @timers[userid])
			userid = idlers[Math.round(Math.random()*(idlers.length-1))]
			j.log('trying '+userid)

		if (@timers[userid] || (!j.users[userid]))
			@recycling--
			return

		j.bot.pm("Hi! I'm a robot fueled by internet juice and afk TTfm listeners. Are you still listening?", userid)
		
		user = j.users[userid]
		j.log('Doing idle check on '+user.name)
		@timers[userid] = setTimeout warn2, (1000*((Math.random()*20)+15))
		warn2 = =>
			j.bot.pm("I hunger.", userid)
			@timers[userid] = setTimeout dasboot, (1000*((Math.random()*20)+15))
		dasboot = =>
			j.bot.pm("nom nom nom.", userid)
			@cancel userid
			msg = ''
			for i in [1...10]
				if (Math.random()>0.8)
					msg+='nom '
				if (Math.random()>0.8)
					msg+='om '
			j.bot.boot userid, msg
		
		@timers[userid] = setTimeout warn2, (1000*60)
			

	unload: (c, d)=>
		@cancel userid for userid of @timers

		clearTimeout @timeid
		c d
# class GarbageCollector

module.exports = GarbageCollector;

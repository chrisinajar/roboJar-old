config = require './config'

class IdleBoot
	constructor:(@j)->
		@timers = {}
		@warnings = []
		
		j.on this, 'endsong', (d)=>
			@endSong(d)

		j.on this, 'rem_dj', (d)=>
			@cancel(d.userid)

		j.on this, 'booted_user', (d)=>
			@cancel(d.userid)

		j.on this, 'deregistered', (d)=>
			@cancel(d.userid)
		
		j.on this, 'speak', (d)=>
			@cancel(d.userid, true)

	cancel: (userid, good)->
		if (@timers[userid])
			clearTimeout @timers[userid]
			delete @timers[userid]
			if (good)
				@j.speak('You\'re good, thanks!')
		# j:j.modules.idleboot.friendlyBoot('4e42c21b4fe7d02e6107b1ff')
	endSong: (d)->
		j = @j
		userid = d.room.metadata.current_dj
		user = j.users[userid]
		idletime = user.getIdleTime()
		
		console.log 'idle boot', idletime
		
		if (idletime > (config.idleBoot || (1000*60*30)))
			@friendlyBoot(userid)

	friendlyBoot: (userid)=>
		if (@timers[userid])
			return
		j = @j
		user = j.users[userid]
		
		j.speak('@'+user.name+' wake up! No one wants an AFK dj! (warning 1)')
	
		warn2 = =>
			j.speak('@'+user.name+' wake up! No one wants an AFK dj! (warning 2)')
			@timers[userid] = setTimeout warn3, (1000*60)
		warn3 = =>
			j.speak('@'+user.name+' wake up! No one wants an AFK dj! (LAST WARNING, :boot: IN A FEW SECONDS)')
			@timers[userid] = setTimeout dasboot, (1000*((Math.random()*20)+15))
		dasboot = =>
			j.speak('Sorry bro')
			j.bot.remDj (userid)
			@cancel(userid)
		
		@timers[userid] = setTimeout warn2, (1000*60)
			
			
	unload: (cb, d)->
		@cancel userid for userid of @timers

		cb?(d)
		
module.exports = IdleBoot



// load my shit!
var Bot = require('../ttapi/index'),
    readline = require('readline'),
    util = require('util'),
    jar = require('./robot').roboJar;

// set up my settings for settage at a future date.
var AUTH  = 'auth+live+8f82e0b0ccb05ebb0f417983e9d0812b5186f29b';
var USERID = '4f2ca85aa3f75176bb00a06c';
var ROOMID = '4ded3b7e99968e1d29000047';

var bot = new Bot(AUTH, USERID);

bot.on('ready', function() {
	jar.onLoad(util, bot, ROOMID);
});
bot.on('speak', jar.onSpeak);
bot.on('newsong', jar.onNewSong);
bot.on('registered', jar.onUserJoin);
bot.on('deregistered', jar.onUserPart);


// start up the console
rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt('roboJar> ', 9);
rl.on('line', jar.onCommand);
rl.on('close', jar.unload);
rl.prompt();
jar.rl = rl;

process.on('exit', function () {
	jar.onUnload();
});


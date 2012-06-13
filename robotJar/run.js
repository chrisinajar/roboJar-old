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

// load my shit!
var Bot = require('ttapi'),
    readline = require('readline'),
    util = require('util'),
    jar = require('./robot').roboJar,
    config = require('./config');

// Add support for coffee modules.
require('coffee-script');

console.log();
console.log('Starting up...');

// set up my settings for settage at a future date.
var AUTH  = config.auth; // 'auth+live+xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
var USERID = config.userid; //'4f2ca85aa3f75176bb00a06c'
var ROOMID = config.roomid; //'4ded3b7e99968e1d29000047'

var bot = new Bot(AUTH, USERID);

var timeoutId = setTimeout(function() {
	process.exit();
}, 20000);

bot.on('ready', function() {
	clearTimeout(timeoutId);
	console.log('Bot is ready!');
	jar.onLoad(util, bot, ROOMID);
});

// start up the console
rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt(config.name+'> ', 9);
rl.on('line', jar.onCommand);
rl.on('close', jar.unload);
rl.prompt();
jar.rl = rl;

process.on('exit', function () {
	jar.onUnload();
});


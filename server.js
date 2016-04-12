
const fs = require('fs');
const LineByLineReader = require('line-by-line');
const restify = require('restify');
const skype = require('skype-sdk');
const HashMap = require('hashmap');


var lr = new LineByLineReader('userlist.txt');
var map = new HashMap();


process.env.APP_ID = '2f803c4a-fb46-44ef-b974-742752bf9f3f';
process.env.APP_SECRET = 'vVi5ZGMUOn6NvJAGXr1DT9s';


lr.on('line', function (line) {
	// 'line' contains the current line without the trailing newline character.
	console.log(line);
	var arr = line.split(",");
	map.set(arr[0], arr[1]);
});

/*
fs.readFile('userlist.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});
*/

const botService = new skype.BotService({
    messaging: {
        botId: '28:340042c3-9165-4b28-b4f1-2a051c7cccc6',
        serverUrl : "https://apis.skype.com ",
        requestTimeout : 15000,
        appId: process.env.APP_ID,
        appSecret: process.env.APP_SECRET
    }
});

//botService.

botService.on('personalMessage', (bot, data) => {
	var str = data.from;
	var arr = str.split(":");
	var name = arr[1];
	if (map.has(name) ){
		bot.reply('Hi, ' + map.get(name) + '. What can I do for you?', true);
	}
	else{
		bot.reply('Who are you? Fuck off', true);
	}

	
    
});

/*
botService.add('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);
*/

const server = restify.createServer();
server.post('/v1/chat', skype.messagingHandler(botService));
const port = process.env.PORT || 8080;
server.listen(port);
console.log('Listening for incoming requests on port ' + port); 

const fs = require('fs');
const LineByLineReader = require('line-by-line');
const restify = require('restify');
const skype = require('skype-sdk');
const HashMap = require('hashmap');
const builder = require('botbuilder');


var lr = new LineByLineReader('userlist.txt');
var map = new HashMap();


process.env.APP_ID = '2f803c4a-fb46-44ef-b974-742752bf9f3f';
process.env.APP_SECRET = 'vVi5ZGMUOn6NvJAGXr1DT9s';


lr.on('line', function (line) {
    // 'line' contains the current line without the trailing newline character.
    //console.log(line);
    var arr = line.split(",");
    map.set(arr[0], arr[1]);
});

const botService = new skype.BotService({
    messaging: {
        botId: '28:340042c3-9165-4b28-b4f1-2a051c7cccc6',
        serverUrl : "https://apis.skype.com ",
        requestTimeout : 15000,
        appId: process.env.APP_ID,
        appSecret: process.env.APP_SECRET
    }
});

var model = 'https://api.projectoxford.ai/luis/v1/application?id=8a5d0cec-688c-4255-bc81-115ce7afca9b&subscription-key=f6f9069274c843aba8f5368bab5a74a5';
var dialog = new builder.LuisDialog(model);

// Create bot and add dialogs
var bot = new builder.SkypeBot(botService);
bot.add('/', dialog);

dialog.on('LocateChild', 
    function(session, intents){
        console.log(JSON.stringify(intents));
    }
);

// Add intent handlers

const server = restify.createServer();
server.post('/v1/chat', skype.messagingHandler(botService));
const port = process.env.PORT || 8080;
server.listen(port);
console.log('Listening for incoming requests on port ' + port); 
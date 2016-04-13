
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

dialog.on('Greeting', 
    function(session, intents){
        //console.log(JSON.stringify(intents));
        if (!session.userData.name ){
        	session.beginDialog('/profile');
        }
        else{
        	session.endDialog('Hi %s! What can I do for you?', session.userData.name);
        	//session.endDialog();
        }
        
    }
);

dialog.on('LocateChild', 
	function(session, indents){
		
		
		console.log("\nUser sent: " + session.message.text);

		console.log("\n" + JSON.stringify(indents) );

		if (!checkEmpty(indents.entities) ){
			session.send("I am searching for your child");
		}
		else{
			session.send("I did not understand you.");
			sendJobs(session);
		}
	}
);

dialog.on('PictureChild',
	function(session, indents){

		console.log("\nUser sent: " + session.message.text);
		console.log("\n" + JSON.stringify(indents) );

		if (!checkEmpty(indents.entities) ){
			session.send("I am requesting the picture");
		}
		else{
			session.send("I did not understand you.");
			sendJobs(session);
		}
		
	}
)

dialog.on('CalmChild',
	function(session, indents){

		console.log("\nUser sent: " + session.message.text);
		console.log("\n" + JSON.stringify(indents) );

		if (!checkEmpty(indents.entities) ){
			session.send("I am comforting your child");
		}
		else{
			session.send("I did not understand you.");
			sendJobs(session);
		}
		
	}
)

dialog.on('Asking',
	function(session, indents){

		console.log("\nUser sent: " + session.message.text);
		console.log("\n" + JSON.stringify(indents) );
		sendJobs(session);
		
	}
)

bot.add('/profile', 
	[
	    function (session) {
	        builder.Prompts.text(session, 'Hi! What is your name?');
	    },
	    function (session, results) {
	        session.userData.name = results.response;
	        //session.send('Hi %s! Nice to meet you. I am BackpackBot.', session.userData.name);
	        session.endDialog('Nice to meet you. I am BackpackBot.');
	        sendJobs(session);
 
	    }
	]

);

function checkEmpty(obj) {
  return !Object.keys(obj).length;
};

function sendJobs(session){
	session.send("So far, I can do these things: ");
	session.send("1. Locate/find your child");
	session.send("2. Show what your child sees");
	session.send("3. Calm your child in case of lost");
	session.send("4. Instruct your child");
}


const server = restify.createServer();
server.post('/v1/chat', skype.messagingHandler(botService));
const port = process.env.PORT || 8080;
server.listen(port);
console.log('Listening for incoming requests on port ' + port); 
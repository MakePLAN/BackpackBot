const Firebase = require("firebase");
const fs = require('fs');
const LineByLineReader = require('line-by-line');
const restify = require('restify');
const skype = require('skype-sdk');
const HashMap = require('hashmap');
const builder = require('botbuilder');


//var lr = new LineByLineReader('userlist.txt');
//var map = new HashMap();
var ref = new Firebase("https://project-backpack.firebaseio.com");
var locReady = false;
var picReady = false;

process.env.APP_ID = '2f803c4a-fb46-44ef-b974-742752bf9f3f';
process.env.APP_SECRET = 'vVi5ZGMUOn6NvJAGXr1DT9s';
/*
lr.on('line', function (line) {
	// 'line' contains the current line without the trailing newline character.
	//console.log(line);
	var arr = line.split(",");
	map.set(arr[0], arr[1]);
});
*/

ref.on("child_changed", function(snapshot) {
  var key = snapshot.key();
  var value = snapshot.val();

  //console.log("The updated: " + snapshot.key() + " , " + snapshot.val() );
  if (key == "locReady" && value == 1){
  	//console.log("LocReady became 1");
  	locReady = true;
  }
  else if (key == "picReady" && value == 1){
  	//console.log("picReady became 1");
  	picReady = true;
  }

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
		
		//console.log("\nUser sent: " + session.message.text);
		//console.log("UserID: " + JSON.stringify(session.message.from) );
		//console.log("UserID: " + session.message.from.address);
		//console.log("\n" + JSON.stringify(indents) );

		if (!checkEmpty(indents.entities) ){
			session.send("I am searching for your child");
			ref.update({
		    	"getLocation": 1
			});
		}
		else{
			session.send("I did not understand you.");
			sendJobs(session);
		}
		//while(!locReady){

		//}
		locReady = false;
		session.send("I found your child.");

	}
);

dialog.on('PictureChild',
	function(session, indents){

		//console.log("\nUser sent: " + session.message.text);
		//console.log("UserID: " + session.message.from.address);
		
		session.send("I am requesting the picture");
		
		ref.update({
		    "getPicture": 1

		});

		//while(!picReady){

		//}
		picReady = false;
		session.send("I got the picture.");
		
		//console.log("\n" + JSON.stringify(indents) );
		/*
		if (!checkEmpty(indents.entities) ){
			session.send("I am requesting the picture");
		}
		else{
			session.send("I did not understand you.");
			sendJobs(session);
		}
		*/
	}
)

dialog.on('CalmChild',
	function(session, indents){

		//console.log("\nUser sent: " + session.message.text);
		//console.log("UserID: " + session.message.from.address);
		//console.log("\n" + JSON.stringify(indents) );
		
		session.send("I am comforting your child");
		
		ref.update({
		    "comfortChild": 1

		});
		/*
		if (!checkEmpty(indents.entities) ){
			session.send("I am comforting your child");
		}
		else{
			session.send("I did not understand you.");
			sendJobs(session);
		}
		*/
	}
)

dialog.on('CommandChild',
	function(session, indents){

		//console.log("\nUser sent: " + session.message.text);
		//console.log("UserID: " + session.message.from.address);
		//console.log("\n" + JSON.stringify(indents) );
		
		//console.log("\n" + JSON.stringify(indents.entities) );
		/*
		if (!checkEmpty(indents.entities) ){
			session.send("I am comforting your child");
		}
		else{
			session.send("I did not understand you.");
			sendJobs(session);
		}
		*/
		
		session.send("I am instructing your child");
		ref.update({
		    "commandChild": 1

		});
	}
)

dialog.on('Asking',
	function(session, indents){

		//console.log("\nUser sent: " + session.message.text);
		//console.log("\n" + JSON.stringify(indents) );
		sendJobs(session);
		
	}
)

dialog.on('NavigateChild', 
	function(session, indents){
		session.send("Finding a way to the child.");
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

/*
bot.add('/requestMap', 
	[
		function (session){
			console.log('message type: ' + session.message.type);
			//builder.Prompts
		}
	]
);*/


function checkEmpty(obj) {
  return !Object.keys(obj).length;
};

function sendJobs(session){
	
	session.send("So far, I can do these things: \n1. Locate/find your child \n2. Show what your child sees \n3. Calm your child in case of lost\n4. Instruct your child");
	
	//session.send("\n My jobs");
}

const server = restify.createServer();
server.post('/v1/chat',skype.messagingHandler(botService));
const port = process.env.PORT || 8080;
server.listen(port);
console.log('Listening for incoming requests on port ' + port); 
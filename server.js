const Firebase = require("firebase");
const fs = require('fs');
const LineByLineReader = require('line-by-line');
const restify = require('restify');
const skype = require('skype-sdk');
const HashMap = require('hashmap');
const builder = require('botbuilder');
const GoogleMapsAPI = require('googlemaps');
var imgur = require('imgur-node-api');
var imgur1 = require('imgur');
const path = require('path');
const connector = require('botconnector');
const msRest = require('ms-rest');


var ref = new Firebase("https://project-backpack.firebaseio.com");
var startNavi = false;
var picLink = "";
var needLocation = false;

process.env.APP_ID = '2f803c4a-fb46-44ef-b974-742752bf9f3f';
process.env.APP_SECRET = 'vVi5ZGMUOn6NvJAGXr1DT9s';

var publicConfig = {
  key: 'AIzaSyDatgOjWYvmc0sUTxS1V1kuG0fzOUkAho4',
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             true, // use https
  proxy:              '' // optional, set a proxy for HTTP requests
};

var gmAPI = new GoogleMapsAPI(publicConfig);

imgur.setClientID('31fdaa6d92294ea');
imgur1.setClientId('31fdaa6d92294ea');
/*
imgur.getCredits(function (err, res) {
  console.log(res.data);
});
*/

var userID;
var childName; 
var currNum = 0; 
var directions = "";


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


//get location from the user 
botService.on('groupMessage', (bot, data) => {
    
    //bot.reply(data.content, true);
    
    var index = data.content.search("where1");

    
    //console.log( (data.content).charAt(index + 7)   );
    var result = "";

    for (var i = index + 7; i < data.content.length; i++){
        if ( (data.content).charAt(i) == '&'  ){
            break;
        }
        else{
            result += (data.content).charAt(i);
        }
    }

    
    ref.update({
		    "pCord": result

	});
	
    //console.log(result);
	
});

bot.add('/', dialog);

dialog.on('Greeting', 
    function(session, intents){
        //console.log(JSON.stringify(intents));
        //console.log("UserID: " + session.message.from.address);

        if (!session.userData.name ){
        	session.beginDialog('/profile');
        	userID = session.message.from;
        	//session.userData.skypeid = session.message.from.address;
        }
        else{
        	
        	session.endDialog('Hi %s! What can I do for you?', session.userData.name);

        	//session.endDialog();
        }
        
    }
);

dialog.on('LocateChild', 
	function(session, indents){

		if (!checkEmpty(indents.entities) ){
			
			
			session.endDialog("Before I search for %s, Can you share your location with Map?", childName);
			//session.beginDialog("/getLocation");
			
		}
		else{
			session.endDialog("I did not understand you.");
			sendJobs(session);

		}
		

	}
);

dialog.on('PictureChild',
	function(session, indents){

		ref.update({
		    "getPicture": 1

		});

		session.endDialog("I am requesting the picture");
		//session.beginDialog('/getPicture');
	
	}
)

dialog.on('CalmChild',
	function(session, indents){
		
		session.send("I am comforting %s", childName);
		
		ref.update({
		    "comfortChild": 1

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
	function(session){
		if (needLocation){
			if (session.message.text == "yes"){
				//session.endDialog();
				//session.beginDialog('/navigation');
				session.replaceDialog('/navigation');
			}
			else if (session.message.text == "no"){
				session.endDialog("Dont forget about %s before you leave!", childName);
			}
			needLocation = false;
		}
		else{
			session.endDialog("I do not understand you.");
			sendJobs(session);
		}
		
	}
);

dialog.on('NextNavigation', 
	function(session){
		//session.endDialog();
		//session.beginDialog('/nextStep');
		if (startNavi){
			session.replaceDialog('/nextStep');
		}
		else{
			session.endDialog("Your navigation is not started");
		}
		
	}
);

dialog.on('DoneNavigation', 
	function(session){
		if (startNavi){
			currNum = 0; 
			directions = "";
			startNavi = false;
			session.endDialog("Ending the child navigation.");
		}
		else{
			session.endDialog("Your navigation is not started");
		}
		
		
	}
);

bot.add('/getPicture', 
	function (session){
		ref.once("value", function(data){
			session.send("I got the picture");
			var picLink = data.val().picLink;
			//session.send(picLink);
			session.endDialog(picLink);
		});
	}
);

//bot.add('/')

bot.add('/getLocation', 
	
	function (session){
		
		ref.once("value", function(data) {

			var pCord = data.val().pCord;
			var cCord = data.val().cCord;
			
			var params = getMap(pCord , cCord);
			var params1 = getDist(pCord , cCord);
			needLocation = true;
			
			imgur1.uploadFile(gmAPI.staticMap(params))
			    .then(function (json) {
			        //console.log(json.data.link);

			        session.send("I found %s", childName);
					session.send(json.data.link);
					session.send("Green: Your location\nRed: %s's location", childName);

					//console.log(err);
					
					gmAPI.distance(params1, function(err1, result){
					
						var dist = (result.rows[0]).elements[0].distance.text;
						var time = (result.rows[0]).elements[0].duration.text;
						
						session.send("You are about " + dist + ", which is about " + time   
						+ ", away from %s.", childName);
						//session.replaceDialog('/navigation');
						
						session.endDialog("Do you want to start your navigation?");
						//session.beginDialog('/navigation');
						
						
					});



			    })
			    .catch(function (err) {
			        console.error(err.message);
			    });

			/*
			imgur.upload( gmAPI.staticMap(params) , function (err,res) {
			  //console.log(res.data.link);
			    
				session.send("I found %s", childName);
				session.send(res.data.link);
				session.send("Green: Your location\nRed: %s's location", childName);

				//console.log(err);
				
				gmAPI.distance(params1, function(err1, result){
				
					var dist = (result.rows[0]).elements[0].distance.text;
					var time = (result.rows[0]).elements[0].duration.text;
					
					session.send("You are about " + dist + ", which is about " + time   
					+ ", away from %s.", childName);
					//session.replaceDialog('/navigation');
					needLocation = true;
					session.endDialog("Do you want to start your navigation?");
					//session.beginDialog('/navigation');
					
					
				});

			});

			*/



		});

		
	}
);

bot.add('/profile', 
	[
	    function (session) {
	        builder.Prompts.text(session, 'Hi! What should I call you?');
	    },
	    function (session, results) {
	        session.userData.name = results.response;

	        builder.Prompts.text(session, 'What should I call your child?');
	        //session.send('Hi %s! Nice to meet you. I am BackpackBot.', session.userData.name);
	        
	    },
	    function (session, results){
	    	//childName = results.response;
	    	childName = results.response;
	    	session.endDialog('Nice to meet you. I am BackpackBot.');
	        sendJobs(session);
	    }
	]

);

bot.add('/navigation', 

	    function (session) {
	        //console.log(results.response);
	        
	        	session.send("Starting your navigation. \nSay next to proceed with next direction.\nSay done whenever you found %s", childName);
	        	startNavi = true;
	        	ref.once("value", function(data) {
	        		var pCord = data.val().pCord;
					var cCord = data.val().cCord;

	        		var params = getDire(pCord , cCord);
	        		gmAPI.directions(params, function(err, result){

						directions = result.routes[0].legs[0].steps; 
		
						iterateSteps(currNum, directions.length, directions, session);
						session.endDialog();
					});

	        	});

	    }	
);

bot.add('/nextStep', 
	function (session){
		//console.log("Moves: " + moves);
		
		iterateSteps(currNum, directions.length, directions, session);
		session.endDialog();
		
	}
);


//Firebase
ref.on("child_changed", function(data){
	if ( data.key() == "picLink"){
		
		var address = {
			to: userID,

		};
		bot.beginDialog(address, '/getPicture');
	}
	else if (data.key() == "pCord" ){
		var address = {
			to: userID,

		};

		bot.beginDialog(address, '/getLocation');
	}
});

function iterateSteps(current, end, moves, session){
	if (current == end){
		session.endDialog("You arrived at your destination. End of navigation. Good luck finding %s!", childName);
		directions = "";
		currNum = 0; 
		return;
	}

	var step = moves[current];
    var sLoc = step.start_location.lat + ',' + step.start_location.lng; 
    var eLoc = step.end_location.lat + ',' + step.end_location.lng;
    var params = getMap(sLoc, eLoc);
  
    imgur.upload( gmAPI.staticMap(params) , function (err,res) {
	  	
	  	var str = step.html_instructions;
    	var result = str.replace(/<\/?[^>]+(>|$)/g, "");
    	session.send(res.data.link);
		session.send(current +  ". Green: Start Point\nRed: End Point\n" + 
			"Note:" + result + "\n" + 
			"Distance: " + step.distance.value + " m"
		);
		
		//current = current + 1;
		currNum = currNum + 1;
		//session.beginDialog('/nextStep');
		//iterateSteps(current, end, moves, session);
		
		
	});
}

function getDire(parent, child){
	var params = {
		origin: parent, 
		destination: child, 
		mode: 'walking',
		language: 'en'
	};
	return params;
}


function getDist(parent, child){
	var params = {
		origins: parent,
		destinations: child, 
		mode: 'walking',
		language: 'en'
	};

	return params;
}

function getDistance(start, end){

	var params = getDist(start,end);
	var dist;
	var time;

	gmAPI.distance(params, function(err, result){
								
								
		//console.log(  (result.rows[0]).elements[0].distance.text  );
		dist = (result.rows[0]).elements[0].distance.text;
		time = (result.rows[0]).elements[0].duration.text;
		return dist;
		
	});

	
}



function getMap( parent, child){
	var array = parent.split(",");
	var lat1 = parseFloat(array[0]);
	var lon1 = parseFloat(array[1]);

	array = child.split(",");
	var lat2 = parseFloat(array[0]);
	var lon2 = parseFloat(array[1]);

	var d = parseInt( distance(lat1, lon1, lat2, lon2) * 1000 );

	var zoomLevel;
	if (d > 200){
		zoomLevel = 15;
	}
	else{
		zoomLevel = 19;
	}
	//console.log(d * 1000);
	

	var params = {
			  //center: parent,
			  //zoom: zoomLevel,
			  size: '500x400',
			  format: 'jpg',
			  maptype: 'roadmap',
			  markers: [
			    {
			      //location: '3025 Royal St Los Angeles, CA',
			      location: parent,
			      label   : 'A',
			      color   : 'green',
			      shadow  : true
			    }, 
			    {
			    	location: child,
				    label   : 'B',
				    color   : 'red',
				    shadow  : true
			    }
			  ],
			  style: [
			    {
			      feature: 'road',
			      element: 'all',
			      rules: {
			        hue: '0x00ff00'
			      }
			    }
			  ]
			  
			  ,path: [
			    {
			      color: 'blue',
			      weight: '5',
			      points: [
			        parent,
			        child
			      ]
			    }
			  ]
			
	};
	//console.log(gmAPI.staticMap(params) ); // return static map URL
	return params;
}

function distance(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = (lat2 - lat1) * Math.PI / 180;  // deg2rad below
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = 
     0.5 - Math.cos(dLat)/2 + 
     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
     (1 - Math.cos(dLon))/2;

  return R * 2 * Math.asin(Math.sqrt(a));
}

function checkEmpty(obj) {
  return !Object.keys(obj).length;
};

function sendJobs(session){
	
	session.send("So far, I can do these things: \n1. Locate/find %s \n2. Show you what %s sees \n3. Comfort %s in case of lost", childName, childName, childName);
	
	//session.send("\n My jobs");
}

const server = restify.createServer();
server.use(restify.authorizationParser());
server.use(restify.bodyParser());
server.post('/v1/chat',skype.messagingHandler(botService));
const port = process.env.PORT || 8080;
server.listen(port);
console.log('Listening for incoming requests on port ' + port); 
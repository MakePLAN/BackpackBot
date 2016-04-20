const restify = require('restify');
const skype = require('skype-sdk');
const builder = require('botbuilder');


process.env.APP_ID = '2f803c4a-fb46-44ef-b974-742752bf9f3f';
process.env.APP_SECRET = 'vVi5ZGMUOn6NvJAGXr1DT9s';

// Initialize the BotService
const botService = new skype.BotService({
    messaging: {
        botId: '28:340042c3-9165-4b28-b4f1-2a051c7cccc6',
        serverUrl : "https://apis.skype.com ",
        requestTimeout : 15000,
        appId: process.env.APP_ID,
        appSecret: process.env.APP_SECRET
    }
});

// Create bot and add dialogs

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

    //console.log(result);

});



// Setup Restify Server
const server = restify.createServer();
server.post('/v1/chat', skype.messagingHandler(botService));
server.listen(process.env.PORT || 8080, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
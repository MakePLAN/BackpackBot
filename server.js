var restify = require('restify');
var builder = require('botbuilder');

var server = restify.createServer();

//var app = helloBot.verifyBotFramework({ appId: 'PIABot', appSecret: '54611752d7d0439fba045063618a105c' });



var helloBot = new builder.BotConnectorBot();
helloBot.add('/', new builder.CommandDialog()
    .matches('^set name', builder.DialogAction.beginDialog('/profile'))
    .matches('^quit', builder.DialogAction.endDialog())
    .onDefault(function (session) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            session.send('Hello %s!', session.userData.name);
        }
    }));
helloBot.add('/profile',  [
    function (session) {
        if (session.userData.name) {
            builder.Prompts.text(session, 'What would you like to change it to?');
        } else {
            builder.Prompts.text(session, 'Hi! What is your name?');
        }
    },
    function (session, results) {
        session.userData.name = results.response;
        session.send('Hello %s!', session.userData.name);
        session.endDialog();
    }
]);

//var http = require('http').Server(helloBot.verifyBotFramework({ appId: 'PIABot', appSecret: '54611752d7d0439fba045063618a105c' }));
var port = process.env.PORT || 3000;
/*
http.listen(port, function(){
    console.log('listening on ' + port);
});
*/



server.use(helloBot.verifyBotFramework({ appId: 'PIABot', appSecret: '54611752d7d0439fba045063618a105c' }));
server.post('/api/messages', helloBot.listen());

server.listen(port, function () {
    console.log('%s listening to %s', 'PIABot', server.url + '/api/messages' ); 
});

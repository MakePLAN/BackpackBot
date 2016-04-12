
const fs = require('fs');
const restify = require('restify');
const skype = require('skype-sdk');

const botService = new skype.BotService({
    messaging: {
        botId: '28:340042c3-9165-4b28-b4f1-2a051c7cccc6',
        serverUrl : "https://apis.skype.com ",
        requestTimeout : 15000,
        appId: '2f803c4a-fb46-44ef-b974-742752bf9f3f',
        appSecret: 'vVi5ZGMUOn6NvJAGXr1DT9s'
    }
});

botService.on('contactAdded', (bot, data) => {
    bot.reply(`Hello ${data.fromDisplayName}!`, true);
});

botService.on('personalMessage', (bot, data) => {
    bot.reply(`Hey ${data.from}. Thank you for your message: "${data.content}".`, true);
});

const server = restify.createServer();
server.post('/v1/chat', skype.messagingHandler(botService));
const port = process.env.PORT || 8080;
server.listen(port);
console.log('Listening for incoming requests on port ' + port); 
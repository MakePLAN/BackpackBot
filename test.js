 var Connection = require('tedious').Connection;
    var config = {
        userName: 'blee2417',
        password: 'Benji24171717',
        server: 'crowdsource.database.windows.net',
        // If you are on Microsoft Azure, you need this:
        options: {encrypt: true, database: 'AdventureWorks'}
    };
    var connection = new Connection(config);
    connection.on('connect', function(err) {
    // If no error, then good to proceed.
        if (err){
            console.log(err);
        }
        console.log("Connected");
    });
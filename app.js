var Firebase = require("firebase");
var ref = new Firebase("https://project-backpack.firebaseio.com");

ref.update({
    "getLocation": 1

});
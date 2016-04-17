const Firebase = require("firebase");
const fs = require('fs');
const LineByLineReader = require('line-by-line');
const restify = require('restify');
const skype = require('skype-sdk');
const HashMap = require('hashmap');
const builder = require('botbuilder');
const GoogleMapsAPI = require('googlemaps');
var imgur = require('imgur-node-api');
const path = require('path');


//var lr = new LineByLineReader('userlist.txt');
//var map = new HashMap();
var ref = new Firebase("https://project-backpack.firebaseio.com");
var locReady = false;
var picReady = false;
var picLink = "";

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
//var gmAPI = new GoogleMapsAPI(publicConfig);

imgur.setClientID('ce3c9d5e2a180cc');

            var params = getDire('34.025650,-118.282314' , '34.023809, -118.283956');
            gmAPI.directions(params, function(err, result){

              console.log( JSON.stringify(result.routes[0].legs[0].steps.length ) );
              var moves = result.routes[0].legs[0].steps; 
              for (var i = 0; i < moves.length; i++){
                var step = moves[i];
                var sLoc = step.start_location.lat + ',' + step.start_location.lng; 
                var eLoc = step.end_location.lat + ',' + step.end_location.lng;
                var params1 = getDireMap(sLoc, eLoc);
                console.log(gmAPI.staticMap(params1) + "\n" );
                //console.log(step.html_instructions);
                var str = step.html_instructions;
                var res = str.replace(/<\/?[^>]+(>|$)/g, "");
            
                console.log("Note:" + res + "\n");
                console.log("Distance: " + step.distance.value + " m\n");


              }

          //console.log("after directions");      
          
        });
          


function getDire(parent, child){
  var params = {
    origin: parent, 
    destination: child, 
    mode: 'walking',
    language: 'en'
  };
  return params;
}

function getDiremap( parent, child){
  var params = {
        center: parent,
        zoom: 15,
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



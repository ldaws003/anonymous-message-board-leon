/*
*
*This is to get the recent threads to display on the homepage
*
*/

/*
*example code to use to iterate over collection names
*db.listCollections().toArray(function(err, collInfo){
            
            var collectionNames = [];
            
            collInfo.map((e) => {e.name != "system.indexes" ? collectionNames.push(e.name) : null});
            
            console.log(collectionNames);
          
          });
*/

'use strict';
const express = require('express');
const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const appRecent = express();

appRecent.use(bodyParser.json());
appRecent.use(bodyParser.urlencoded({ extended: true }));

const CONNECTION_STRING = process.env.DB;


function RecentThreadHandler(){
  
  this.recent = function(res, req){
    
    
  
  }

}

module.exports = RecentThreadHandler;
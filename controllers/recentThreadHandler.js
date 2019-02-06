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
const asyncMethod = require('async');

appRecent.use(bodyParser.json());
appRecent.use(bodyParser.urlencoded({ extended: true }));

const CONNECTION_STRING = process.env.DB;

function RecentThreadHandler(){
  
    
  
  this.recent = function(req, res){
     function returnFunction(arrCollection, callback){
       let arrFunc = [];
       
       for(let i = 0; i < arrCollection.length;i++){
        arrFunc.push((callback)=>{
          var collect = arrCollection[i];
          fetchRecent(collect, callback)
        });    
      }
    
      return arrFunc;
    }
    
    function fetchRecent(collection, callback){
      
      MongoClient.connect(CONNECTION_STRING, function(err, db){
        if(err) throw err;
        
        db.collection(collection).find({}).sort({bumped_on: -1}).toArray(function(err, data){
          if(err) callback(null, err);
          data[0].replycount = data[0].replies.length;
          data[0].replies = data[0].replies.slice(-1);
          delete data[0].delete_password;
          delete data.delete_password;
          callback(null, data[0]);        
        });      
      });
    }
    
    
    function callback(err, results){
      if(err) throw err;
      
      var boards = results;
      boards.sort((a,b)=>{
        return b.bumped_on - a.bumped_on;
      });
      boards = results.slice(0,5);
      res.json(boards);
    }
    
    
    
    MongoClient.connect(CONNECTION_STRING, function(err, db){
          db.listCollections().toArray(function(err, collInfo){
            
            var collectionNames = [];
            
            collInfo.map((e) => {e.name != "system.indexes" ? collectionNames.push(e.name) : null});
            
            var newArr = returnFunction(collectionNames); 
            
           // db.collection(collectionNames[3]).find({}).count(function(err, data){console.log(data);});
            
            asyncMethod.parallel(newArr, callback);   
          
          });
    });
    
  
  }

}

module.exports = RecentThreadHandler;
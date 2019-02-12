/*
*
*This is to get the recent threads to display on the homepage
*
*/

'use strict';
const express = require('express');
const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const appRecent = express();
const asyncMethod = require('async');
const moment = require('moment');

appRecent.use(bodyParser.json());
appRecent.use(bodyParser.urlencoded({ extended: true }));

const CONNECTION_STRING = process.env.DB;

function RecentThreadHandler(){
  
  this.allBoards = function(req,res){
    
    MongoClient.connect(CONNECTION_STRING, function(err, db){
      if (err) throw err;
      
      db.listCollections().toArray(function(err, collInfo){
            
            var collectionNames = [];
            
            collInfo.map((e) => {e.name != "system.indexes" ? collectionNames.push(e.name) : null});

            res.json(collectionNames);
        
          });
    });
   
  }
  
    
  
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
          if(!data[0]){
            callback(null, null);
            return;
          };
          data[0].replycount = data[0].replies.length;
          data[0].replies = data[0].replies.slice(-1);
          data[0].threadCount = data.length;
          delete data[0].delete_password;
          delete data.delete_password;
          callback(null, data[0]);        
        });      
      });
    }
    
    
    function callback(err, results){
      if(err) throw err;
      
      var boards = results.filter((a) => a != null).sort((a,b)=>{
        return b.bumped_on - a.bumped_on;
      }).slice(0,5); 
      boards.forEach((ele)=>{
        ele.bumped_on = moment(new Date(ele.bumped_on)).calendar();
        ele.board =  ele.board.replace(/_/g, ' ');
        ele.replies.forEach((ele)=>{
          ele.created_on = moment(new Date(ele.created_on)).calendar();        
        });
      })
      res.json(boards);
    }
    
    
    
    MongoClient.connect(CONNECTION_STRING, function(err, db){
          db.listCollections().toArray(function(err, collInfo){
            
            var collectionNames = [];
            
            collInfo.map((e) => {e.name != "system.indexes" ? collectionNames.push(e.name) : null});
            
            var newArr = returnFunction(collectionNames); 
            
            asyncMethod.parallel(newArr, callback);   
          
          });
    });
    
  
  }

}

module.exports = RecentThreadHandler;
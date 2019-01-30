//
//
//  API CRUD for Boards
//
//
//


'use strict';
const express = require('express');
const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const appBoard = express();

appBoard.use(bodyParser.json());
appBoard.use(bodyParser.urlencoded({ extended: true }));

const CONNECTION_STRING = process.env.DB;

function BoardHandler(){
  
  this.threadList = function(req, res){

    
    var board =  req.body.board || req.params.board;       
        
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          
          
          db.collection(board).find({}, {reported: 0, delete_password: 0}).sort({bumped_on: -1}).toArray(function(err, data){
            if(err) console.log(err);           
            
            data.forEach((doc) => {
              doc.replycount = doc.replies.length;
              doc.replies = doc.replies.slice(-3);
            });
                                 
            res.json(data);            
          });
        });  
  }
  
  this.newThread = function(req, res){
       var data = JSON.parse(JSON.stringify(req.body));
       var board = data.board || req.params.board;;
          
       data.created_on = new Date();
       data.bumped_on = new Date();
       data.reported = false;
       data.replies = [];  
      
              
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
         db.collection(board).insertOne(data, function(err, data){
           if(err) console.log(err);           
           
           db.collection(board).findOne({board: data.ops[0].board}, function(err, data){
             if(err) console.log(err);
             
             res.redirect('/b/' + board + '/');
             
             db.close();
           })
         });
       });
  
  }
  
  this.reportThread = function(req, res){
    var report_id = req.body.report_id;
        var board = req.body.board || req.params.board;
    
        MongoClient.connect(CONNECTION_STRING, function(err, db){
          if(err) console.log(err);
          
          db.collection(board).findOneAndUpdate({_id: new ObjectId(report_id)},
                                                {$set: {reported: true}},
                                                function(err, docs){
            if(err) console.log(err)
            
            if(docs.value){
              res.type('text').send('success');
            } else {
              res.type('text').send('failure');
            }
          });
        });
  
  }
  
  this.deleteThread = function(req, res){
      
        var thread_id = req.body.thread_id;
        var delete_password = req.body.delete_password;
        var board = req.body.board || req.params.board;
           
    
        MongoClient.connect(CONNECTION_STRING, function(err, db){
          if(err) console.log(err);
          
          db.collection(board).findOneAndDelete({_id: new ObjectId(thread_id), delete_password: delete_password},function(err, doc){
            if(err) console.log(err)
            
            if(doc.value){
              res.type('text').send("success");
            } else {
              res.type('text').send("incorrect password");
            }
          });
        });
  }

}

module.exports = BoardHandler;
/*
*
*
*  api CRUD for threads
*
*
*
*
*
*/


'use strict';
const express = require('express');
const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const appThread = express();
const moment = require('moment');

appThread.use(bodyParser.json());
appThread.use(bodyParser.urlencoded({ extended: true }));

const CONNECTION_STRING = process.env.DB;

function ThreadHandler() {
  
  this.replyList = function(req, res){
    
    //this gets the given thread and all of its replies
       var board = req.body.board || req.params.board;  
    
        
        var thread_id = req.body.thread_id || req.query.thread_id;
    
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          if(err) console.log(err);
          
          db.collection(board).findOne({_id: new ObjectId(thread_id)}, function(err, data){
            if(err) console.log(err);
            data.created_on = moment(new Date(data.created_on)).calendar();
            data.bumped_on = moment(new Date(data.created_on)).calendar();
            data.replies.forEach((reply) => {
              reply.created_on = moment(new Date(reply.created_on)).calendar();;            
            });
            res.json(data);
          });
        
        });      
  }
  
  this.newReply = function(req, res){
    
        //this creates a new reply for a given thread
    
        var data = JSON.parse(JSON.stringify(req.body));
        
        var board = data.board || req.params.board;
  
        var saveObj = {
          delete_password: data.delete_password,
          text: data.text,
          created_on: new Date(),
          _id: new ObjectId(),
          reported: false
        };
            
    
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          if(err) console.log(err);
          
          db.collection(board).findOneAndUpdate({_id: ObjectId(data.thread_id)},
                                                {$push: {replies: saveObj},
                                                 $currentDate: {bumped_on: true}},
                                                {new: true, upsert: false},
                                                function(err, doc){            
            if(err) console.log(err);
            
            res.redirect("/b/"+board+"/"+data.thread_id);            
          });
        });
  
  }
  
  this.reportReply = function(req, res){
    
        //this function allows for the reporting of a given reply
    
        var thread_id = req.body.thread_id;
        var reply_id = req.body.reply_id;
        var board = req.body.board || req.params.board;
    
        
        MongoClient.connect(CONNECTION_STRING, function(err, db){
          if(err) console.log(err);
          
          db.collection(board).findOneAndUpdate({_id: new ObjectId(thread_id),
                                                 replies: {$elemMatch: {_id: new ObjectId(reply_id)}}},
                                                {$set: {"replies.$.reported": true}},
                                                function(err, docs){
            if(err) console.log(err);
            
            if(docs.value){
              res.type('text').send('success');
            } else {
              res.type('text').send('failure');
            }
          });
        });
  
  }
  
  this.deleteReply = function(req, res) {
    
        //this function allows for the deletion of a given reply
    
        var board = req.body.board || req.params.board;
        var reply_id = req.body.reply_id;
        var thread_id = req.body.thread_id;
        var delete_password = req.body.delete_password;
    
        MongoClient.connect(CONNECTION_STRING, function(err, db){
          if(err) console.log(err);
          
          db.collection(board).findOneAndUpdate({_id: new ObjectId(thread_id),
                                        replies: {$elemMatch: {delete_password: delete_password, _id: new ObjectId(reply_id)}}},
                                        {$set: {"replies.$.text": "[deleted]"}},                                        
                                        function(err, doc){
            if(err) console.log(err);
            
            if(doc.value){
              res.type('text').send("success");
            } else {
              res.type('text').send('incorrect password');
            }
            
          });
        });  
  
  }

}

module.exports = ThreadHandler;
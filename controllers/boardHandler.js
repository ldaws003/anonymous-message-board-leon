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
const moment = require('moment');

appBoard.use(bodyParser.json());
appBoard.use(bodyParser.urlencoded({ extended: true }));

const CONNECTION_STRING = process.env.DB;

function BoardHandler(){
  
  this.threadList = function(req, res){
    
    
    //this fetches the the threads within a given board    
    var board =  req.body.board || req.params.board;       
        
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          
          
          db.collection(board).find({}, {reported: 0, delete_password: 0}).sort({bumped_on: -1}).toArray(function(err, data){
            if(err) console.log(err);           
            
            data.forEach((doc) => {
              doc.replycount = doc.replies.length;
              doc.bumped_on = moment(new Date(doc.bumped_on)).calendar();
              doc.created_on = moment(new Date(doc.created_on)).calendar();
              doc.replies = doc.replies.slice(-3);
              doc.replies.forEach((reply) => {
                reply.created_on = moment(new Date(reply.created_on)).calendar();
              });
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
      
     //this creates a new thread within a given board
              
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
    
    
       //this makes it so that a thread can be reported
    
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
    
        //this deletes a specific thread
      
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
  
  this.createBoard = function(req, res){ 
    
    
    //this function creates aboard, not currently used may delete later
    
    var board_name = req.body.board_name.trim();
    var password = req.body.new_board_password.trim();
    
    if(password != "password"){
      res.status(401).send({message: "incorrect password"});
      return;
    }
    
    function CreateBoard(db, board){
      db.listCollections({name: board})
                    .next(function(err, isHere){
                              if(err) console.log(err);
                              
                              if(Boolean(isHere)){
                                res.status(409).send({message: "This board already exists"});                             
                              } else {
                                db.createCollection(board);
                                res.json({message: 'Creation of the ' + board + ' board was successful.\nClick OK to go there.', board: board});                              
                              }               
                    });
    }
    
    MongoClient.connect(CONNECTION_STRING, function(err, db){
      if(err) console.log(err);   
      
      
      CreateBoard(db, board_name);    
    });
    
  }

}

module.exports = BoardHandler;
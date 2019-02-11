
'use strict';
const express = require('express');
const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const app = express();
const apiBoard = require("../controllers/boardHandler.js");
const apiThread = require("../controllers/threadHandler.js");
const apiRecent = require("../controllers/recentThreadHandler.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const CONNECTION_STRING = process.env.DB;


module.exports = function(app) {
  
  var threadHandler = new apiThread();
  var boardHandler = new apiBoard();
  var recentThreadHandler = new apiRecent();
  
  app.route('/api/threads/:board')
    .get(boardHandler.threadList)
    .post(boardHandler.newThread)
    .put(boardHandler.reportThread)
    .delete(boardHandler.deleteThread);
    
  app.route('/api/replies/:board')
    .get(threadHandler.replyList)
    .post(threadHandler.newReply)
    .put(threadHandler.reportReply)
    .delete(threadHandler.deleteReply);
  
  app.route('/api/recent')
    .get(recentThreadHandler.recent);
  
  app.route('/api/allboards')
    .get(recentThreadHandler.allBoards);
};
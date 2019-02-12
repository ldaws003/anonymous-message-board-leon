/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

var thread1_id;
var thread1_reply_id;
var thread2_id;
var board = 'general';

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      
      test('create two new threads', function(done){
        
        chai.request(server)
        .post('/api/threads/:board')
        .send({
          board: board,
          text: 'test',
          delete_password: 'test'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
        });
        chai.request(server)
        .post('/api/threads/:board')
        .send({
          board: board,
          text: 'test',
          delete_password: 'test'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });      
      });      
    });
    
    suite('GET', function() {
      
      test('most recent 10 threads with most recent 3 threads', function(done){
        chai.request(server)
        .get('/api/threads/:board')
        .send({
          board: board
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach((thread) => {
            assert.property(thread, 'replycount');
            assert.typeOf(thread.replycount, 'number');
            assert.isAtMost(thread.replies.length, 3);
            assert.property(thread, '_id');
          });
          
          thread1_id = res.body[0]._id;
          thread2_id = res.body[1]._id;
          done();
        });
      
      });     
    });
    
    suite('PUT', function() {
      
      test('report most recent thread, checking when successful and when not', function(done){
        chai.request(server)
        .put('/api/threads/:board')
        .send({
          board: board,
          report_id: thread1_id
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success', 'testing with a correct thread_id');
        });
        
        chai.request(server)
        .put('/api/threads/:board')
        .send({
          board: board,
          report_id: "5c24d25b79559e121d4ab240"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'failure', 'testing with an incorrect thread_id');
          done();
        });
      
      });
      
    });
    
    suite('DELETE', function() {
      
      test('deleting one of the threads', function(done){
        chai.request(server)
        .delete('/api/threads/:board')
        .send({
          thread_id: thread2_id,
          delete_password: 'salsa',
          board: board
          
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password', 'testing response when password is incorrect');
        });
        
        chai.request(server)
        .delete('/api/threads/:board')
        .send({
          thread_id: thread2_id,
          delete_password: 'test',
          board: board
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success', 'testing resopnse when password is correct');
          done();
        });
      });
      
    });   

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
      test('creating a reply to a thread', function(done){
        
        chai.request(server)
        .post('/api/replies/:board/')
        .send({
          delete_password: 'test',
          text: 'test',
          board: board,
          thread_id: thread1_id
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });
        
      });
      
    });
    
    suite('GET', function() {
      
      test('GET response for replies within threads',function(done){
        
        chai.request(server)
        .get('/api/replies/:board/')
        .send({
          board: board,
          thread_id: thread1_id
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body.replies);
          
          res.body.replies.forEach((reply) => {
            assert.property(reply, '_id');
            assert.property(reply, 'text');
            assert.equal(reply.delete_password, 'test');
            assert.property(reply, 'reported');
          });
          
          thread1_reply_id = res.body.replies[0]._id;
          done()          
        });
      });
      
    });
    
    suite('PUT', function() {
      
      test('PUT response for replies. Reporting a reply', function(done){
        
        chai.request(server)
        .put('/api/replies/:board/')
        .send({
          board: board,
          thread_id: thread1_id,
          reply_id: "5c24d25b79559e121d4ab240"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'failure', 'testing when the reply id is wrong');                    
        });
        
        chai.request(server)
        .put('/api/replies/:board/')
        .send({
          board: board,
          thread_id: thread1_id,
          reply_id: thread1_reply_id
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success', 'testing when the reply id is correct');
          done();
        });
      });
      
    });
    
    suite('DELETE', function() {
      
      test('DELETE response for replies. Deleting a reply.', function(done){
        
        chai.request(server)
        .delete('/api/replies/:board/')
        .send({
          board: board,
          thread_id: thread1_id,
          reply_id: thread1_reply_id,
          delete_password: 'salsa'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password', 'testing when the delete password is wrong');
        });
        
        chai.request(server)
        .delete('/api/replies/:board/')
        .send({
          board: board,
          thread_id: thread1_id,
          reply_id: thread1_reply_id,
          delete_password: 'test'        
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success', 'testing when the delete password is correct');
          done();
        });
      });
      
    });
    
    suite('GET', function(){
      
      test('GET response for getting a list of all colections.', function(done){
        
        chai.request(server)
          .get('/api/allboards')
          .send()
          .end();
      
      });
    
    });
    
  });

});

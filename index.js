/*
* Copyright 2017 Kristopher Clark
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

// Required modules
var express = require('express');
var http    = require('http');
var mysql   = require('mysql');
var app     = express();

// Application configuration
var port    = 3000;
var table   = "crud";

// Our connection pool to MySQL
var connectionPool;

var db = {
    username: 'root',
    password: '',
    hostname: 'localhost',
    database: 'krisboxorg'
};

var createConnectionPool = function() {
    return new Promise(function(fulfill, reject) {
        try {
            fulfill(mysql.createPool({
                connectionLimit : 100,
                host     : db.hostname,
                user     : db.username,
                password : db.password,
                database : db.database,
                debug    :  false
            }));
        }catch(err){
            reject(err);
        }
    });
};

var queryDatabase = function(query) {
    return new Promise(function(fulfill, reject) {
        try {
            connectionPool.query(query,function(err,result,fields){
                if(err)
                    reject(err);
                else
                    fulfill(result);
            });
        }catch(err){
            reject(err);
        }
    });
};

var crud = {
    create: function(username, email, password){
        return queryDatabase("insert into "+table+" VALUES (null,'"+username+"','"+email+"',md5('"+password+"'))");
    },
    read:   function(username){
        return queryDatabase("select * from "+table+" where username = '" + username +"'");
    },
    update: function(username, password){
        return queryDatabase("UPDATE "+table+" SET password=md5('"+password+"') WHERE username='" + username+"'");
    },
    delete: function(username){
        return queryDatabase("delete from "+table+" where username='"+username+"'");
    }
};

createConnectionPool().then(function(pool) {
    console.log('Connection pool created');
    connectionPool = pool;

    console.log('Starting CRUD Application');

    app.listen(port, function () {
        console.log('Example app listening on port '+port+'!')
    });
},function(err) {
    console.log('Error:' + err);
});

app.get('/create/:username/:email/:password', function (req, res) {
    crud.create(req.params.username,req.params.email,req.params.password).then(function(result) {
      res.json(result);
    },function(err){
        res.json(err);
    });

});

app.get('/read/:username', function (req, res) {
    crud.read(req.params.username).then(function(result) {
      res.json(result);
    },function(err){
        res.json(err);
    });
});

app.get('/update/:username/:password', function (req, res) {
    crud.update(req.params.username, req.params.password).then(function(result) {
      res.json(result);
    },function(err){
        res.json(err);
    });
});

app.get('/delete/:username', function (req, res) {
    crud.delete(req.params.username).then(function(result) {
      res.json(result);
    },function(err){
        res.json(err);
    });
});
/* eslint-disable */
'use strict';

var server = require('./server');

var ds = server.dataSources.local;
var tables = ['User', 'AccessToken', 'ACL', 'Application','RoleMapping','Role', 'account','userIdentity','userCredential'];

ds.automigrate(tables, function(er) {
  if (er) throw er;
  console.log('Loopback tables [' + tables + '] created in ', ds.adapter.name);
  ds.disconnect();
});


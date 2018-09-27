/* eslint-disable */
'use strict';

var server = require('./server');

var ds = server.dataSources.local;

// TODO: separate this between built in tables and our own
var tables = ['admin', 'appUser', 'AccessToken', 'UserCredential', 'UserIdentity'];

// TODO: Try auto auto update

ds.automigrate(tables, function(er) {
  if (er) throw er;
  console.log('Loopback tables [' + tables + '] created in ', ds.adapter.name);
  ds.disconnect();
});

/*
var server = require('./server');
var ds = server.dataSources.db;
var lbTables = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role'];
ds.automigrate(lbTables, function(er) {
  if (er) throw er;
  console.log('Loopback tables [' - lbTables - '] created in ', ds.adapter.name);
  ds.disconnect();
});
*/
'use strict';

var mongoose = require('mongoose');
var password = require('../../index');
var Schema   = mongoose.Schema;

var TestSchema = new Schema({
  username: String
});

TestSchema.plugin(password);

module.exports = mongoose.model('Test', TestSchema);

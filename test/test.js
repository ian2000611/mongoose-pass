'use strict';
/* global describe, before, beforeEach, after, afterEach, it */
/* jshint maxlen: false */

var expect   = require('expect.js');
var mongoose = require('mongoose');

describe('mongoose-pass', function () {
  // Connect to the database
  before(function (done) {
    mongoose.connect('mongodb://127.0.0.1/mongoose-pass-test', done);
  });

  // Delete the database after testing
  after(function (done) {
    mongoose.connection.db.dropDatabase(done);
  });

  // Level 1 tests
  describe('Level 1', function () {

    it('should hash the password when a new model is saved', function (done) {
      var TestModel = require('./fixtures/default');
      var newModel  = new TestModel({
        username: 'test',
        password: 'testPassword'
      });
      newModel.save(function (err, model) {
        expect(err).to.be(null);
        expect(model).to.be.an(Object);
        expect(model.username).to.be('test');
        expect(model.password).to.not.be('testPassword');

        model.authenticate('testPassword', function (err, isMatch) {
          expect(err).to.be(null);
          expect(isMatch).to.be(true);
          done();
        });
      });
    });

    it('should hash the password with a custom path', function (done) {
      var TestModel = require('./fixtures/custom-path');
      var newModel  = new TestModel({
        username: 'test',
        pass: 'testPassword'
      });
      newModel.save(function (err, model) {
        expect(err).to.be(null);
        expect(model).to.be.an(Object);
        expect(model.username).to.be('test');
        expect(model.pass).to.not.be('testPassword');

        model.authenticate('testPassword').then(function (isMatch) {
          expect(isMatch).to.be(true);
          done();
        }, done);
      });
    });

    it('should not update the password when the password field is not updated', function (done) {
      var TestModel = require('./fixtures/default');
      var newModel  = new TestModel({
        username: 'test',
        password: 'testPassword'
      });
      newModel.save(function (err, model) {
        expect(err).to.be(null);
        expect(model).to.be.an(Object);
        expect(model.username).to.be('test');
        expect(model.password).to.not.be('testPassword');
        var hashed = model.password;

        model.authenticate('testPassword', function (err, isMatch) {
          expect(err).to.be(null);
          expect(isMatch).to.be(true);

          model.username = 'test2';
          model.save(function (err, model) {
            expect(err).to.be(null);
            expect(model.username).to.be('test2');
            expect(model.password).to.be(hashed);
            done();
          });
        });
      });
    });

  });
});

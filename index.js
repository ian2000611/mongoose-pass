'use strict';

var Promise = require('bluebird');
var bcrypt  = Promise.promisifyAll(require('bcrypt'));

module.exports = function createdAt(schema, options) {
  // http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt

  // Set the default options
  options = options || {};
  var passwordPath   = options.passwordPath || 'password';
  var authMethod     = options.authMethod || 'authenticate';
  var saltWorkFactor = options.saltWorkFactor || 10;


  // Set the new path
  schema
    .path(passwordPath, String)
    .path(passwordPath).required(true);


  // This is the middleware that actually hashes the password
  schema.pre('save', function (next) {
    var model = this;
    // only hash the password if it has been modified (or is new)
    if (!model.isModified(passwordPath)) { return next(); }

    bcrypt
      // Generate the salt
      .genSaltAsync(saltWorkFactor)
      // Generate the hash
      .then(function (salt) {
        return bcrypt.hashAsync(model.get(passwordPath), salt);
      })
      // Replace the given unhashed password with the hashed version
      .then(function (hash) {
        model.set(passwordPath, hash);
        next();
      }, next); // pass in next as the error handler. Eat that callbacks!
  });


  // This is the authentication method
  schema.method(authMethod, function (comparePassword, cb) {
    var compare = bcrypt.compareAsync(comparePassword, this.get(passwordPath));
    if (typeof cb === 'function') {
      compare.then(function (isMatch) {
        cb(null, isMatch);
      }, cb);
    }
    return compare;
  });

};

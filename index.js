'use strict';
var debug = require('debug')('mongoose-pass');
var Promise = require('bluebird');
var bcrypt	= Promise.promisifyAll(require('bcrypt'));
var mongoose = require('mongoose');
module.exports = function createdAt(schema, options) {
	// http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt

	// Set the default options
	options = options || {};
	var passwordPath	 = options.passwordPath || 'password';
	var authMethod		 = options.authMethod || 'authenticate';
	var loginMethod		= options.loginMethod || 'login';
	var saltWorkFactor = options.saltWorkFactor || 10;
	var modelName			 = options.modelName;
	var userField			= options.userField;
	
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
		return bcrypt
			.compareAsync(comparePassword, this.get(passwordPath))
			.nodeify(cb);
	});

	function AuthError(message) {
		this.name="AuthError";
		this.message = message || "Auth Failure";
	}
	AuthError.prototype = Error.prototype;

	if (typeof modelName =='string' && typeof userField == 'string') {
		schema.static(loginMethod, function (username, comparePassword, cb) {
			require('mongoose')
			.model(modelName)
			.findOne()
			.where(userField)
			.equals(username)
			.exec(function(err,user) {
				if (err) {
					cb(new AuthError(err.message));
				} else {
					user[authMethod](comparePassword, function(err,success) {
						if (err) {
							cb(new AuthError(err.message));
						} else if (success===false) {
							cb(new AuthError());
						} else {
							cb(null,user);
						}
		
					});
		                }
			});
		});
	}
}

# mongoose-pass

[![NPM version](http://img.shields.io/npm/v/mongoose-pass.svg?style=flat)](https://www.npmjs.org/package/mongoose-pass)
[![Dependency Status](http://img.shields.io/gemnasium/ksmithut/mongoose-pass.svg?style=flat)](https://gemnasium.com/ksmithut/mongoose-pass)
[![Code Climate](http://img.shields.io/codeclimate/github/ksmithut/mongoose-pass.svg?style=flat)](https://codeclimate.com/github/ksmithut/mongoose-pass)
[![Build Status](http://img.shields.io/travis/ksmithut/mongoose-pass.svg?style=flat)](https://travis-ci.org/ksmithut/mongoose-pass)
[![Coverage Status](http://img.shields.io/codeclimate/coverage/github/ksmithut/mongoose-pass.svg?style=flat)](https://codeclimate.com/github/ksmithut/mongoose-pass)

Another mongoose password hashing module.

# Usage

```javascript
'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var MySchema = new Schema({
  username: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  }
});

MySchema.plugin(require('mongoose-pass'));

MySchema.static('authenticate', function (username, password, cb) {
  // Promise version
  return User.findOne({username: username}).exec().then(function (user) {
    if (!user) { return false; }
    return user.authenticate(password);
  });
  // Callback version
  User.findOne({username: username}, function (err, user) {
    if (err) { return cb(err); }
    if (!user) { return cb(null, false); }
    user.authenticate(password, function (err, isMatch) {
      if (err) { return cb(err); }
      cb(null, isMatch);
    });
  });
});
```

To pass in options:

```javascript
MySchema.plugin(require('mongoose-pass'), {
  passwordPath: 'password',
  authMethod: 'authenticate',
  saltWorkFactor: 10
});
```

Note in the example above that it added an `authenticate()` method. This method
is an instance method. Once you have a model, you call this method passing in
the tentative password as the first parameter. Now, you can either pass in a
callback as the second parameter, or it returns a promise. See examples of both
above.

# Options

* `passwordPath` (String) - The path to add the password property to. Default:
  `'password'`
* `authMethod` (String) - The name of the instance method that authenticates
  a user by password. Default `'authenticate'`
* `saltWorkFactor` (Number) - The salt work factor used to hash the password.
  Increasing this number increases the amount of time it takes to hash a
  password. This is to keep up with Moore's law. Default `10`

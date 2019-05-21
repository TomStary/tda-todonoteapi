const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = require('../config').secret;

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: [ true, "Can't be blank." ], index: true },
  email: { type: String, lowercase: true, unique: true,
     required: [ true, "Can't be blank." ], match: [ /\S+@\S+\.\S+/, 'is invalid' ], index: true },
  todoLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TodoList' }],
  hash: String,
  salt: String }, { timestamps: true });

UserSchema.plugin(uniqueValidator, { message: 'Is already taken.' });

UserSchema.pre('remove', next => {
    this.model('TodoList').remove({ author: this._id }, next);
});

UserSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.addTodoList = function(todoList) {
  this.todoLists.push(todoList);
  todoList.author = this;
};

UserSchema.methods.generateJWT = function() {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  return jwt.sign({ id: this._id, fullname: this.fullname, exp: parseInt(exp.getTime() / 1000) }, secret);
};

UserSchema.static('findByEmail', function (email, callback) {
  return this.find({ email: email }, callback);
});

UserSchema.methods.toAuthJSON = function() {
  return { id: this._id, fullname: this.fullname, email: this.email, token: this.generateJWT() };
};

UserSchema.methods.toJSON = function() {
  return {
    id: this._id,
    fullname: this.fullname,
    email: this.email
   };
};

module.exports = mongoose.model('User', UserSchema);

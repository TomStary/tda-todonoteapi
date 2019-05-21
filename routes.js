const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const TodoList = require("./app/models/TodoList");
const TodoListTask = require("./app/models/TodoListTask");
const User = require("./app/models/User");

const app = express();
const api_path = "/api/v1";
app.use(require('./app/routes'+api_path));

console.log('Method\t\t URI Pattern');
console.log('-------------------------------------------');

function print(path, layer) {
  if (layer.route) {
    layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))));
  } else if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))));
  } else if (layer.method) {
    console.log('%s\t\t '+api_path+'/%s',
      layer.method.toUpperCase(),
      path.concat(split(layer.regexp)).filter(Boolean).join('/'));
  }
}

function split(thing) {
  if (typeof thing === 'string') {
    return thing.split('/');
  } else if (thing.fast_slash) {
    return '';
  } else {
    const match = thing.toString().replace('\\/?', '').replace('(?=\\/|$)', '$')
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
    return match
      ? match[1].replace(/\\(.)/g, '$1').split('/')
      : '<complex:' + thing.toString() + '>';
  }
}

app._router.stack.forEach(print.bind(null, []));

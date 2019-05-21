const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const TodoList = require("./app/models/TodoList");
const TodoListTask = require("./app/models/TodoListTask");
const User = require("./app/models/User");

const nodeEnv = process.env.NODE_ENV || "development";
const isDevelopment = nodeEnv === "development";
const appConfig = require("./config/env.json")[nodeEnv];

mongoose.Promise = global.Promise;
mongoose.connect(appConfig["MONGO_URI"], appConfig["MONGO_OPTIONS"]);
mongoose.set('useCreateIndex', true);

if(isDevelopment) { mongoose.set("debug", true); }

function destroyCollections() {
  User.collection.drop();
  TodoList.collection.drop();
  TodoListTask.collection.drop();
}

function createUserTodoLists(names, descriptions, numbers, userId) {
  const output = [];
  for(let i = 0; i < numbers; i++) {
    output.push(new TodoList({ name: names[i], description: descriptions[i], author: userId }));
  }
  return output;
}

function createUserTodoListTasks(names, descriptions, numbers) {
  const output = [];
  for(let i = 0; i < numbers; i++) {
    output.push(new TodoListTask({ name: names[i], description: descriptions[i] }));
  }
  return output;
}

function setupTodoLists(user, todoLists) {
  for(let i = 0; i < todoLists.length; i++) {
    user.addTodoList(todoLists[i]);
  }
}

function setupTodoListTasks(todoList, todoListTasks) {
  for(let i = 0; i < todoListTasks.length; i++) {
    todoList.addTask(todoListTasks[i]);
  }
}

//
// Destroy database collections
//
destroyCollections();

// Users
const userFirstObject = new User({ fullname: "Demo Demo", email: "demo@demo.com" });
userFirstObject.setPassword("demodemo");
const userSecondObject = new User({ fullname: "Second Demo Demo", email: "second@demo.com" });
userSecondObject.setPassword("demodemo");
const userThirdObject = new User({ fullname: "Third Demo Demo", email: "third@demo.com" });
userThirdObject.setPassword("demodemo");

// Todo lists
const todoListFirst_data = { name: "Work projects", description: "My work tasks." };
const todoListSecond_data = { name: "Home projects", description: "My home tasks." };
const todoListThird_data = { name: "Other projects", description: "Other tasks." };

// Todo list tasks
const todoListTaskFirst_data = { name: "Blue print draft 1", description: "Blue print draft 1" };
const todoListTaskSecond_data = { name: "Blue print draft 2", description: "Blue print draft 2" };
const todoListTaskThird_data = { name: "Blue print draft 3", description: "Blue print draft 3" };

const todoListsNames = [ todoListFirst_data["name"],
  todoListSecond_data["name"], todoListThird_data["name"] ];
const todoListsDescriptions = [ todoListFirst_data["description"],
  todoListSecond_data["description"], todoListThird_data["description"] ];

const todoListTasksNames = [ todoListTaskFirst_data["name"],
  todoListTaskSecond_data["name"], todoListTaskThird_data["name"] ];
const todoListTasksDescriptions = [ todoListTaskFirst_data["description"],
  todoListTaskSecond_data["description"], todoListTaskThird_data["description"] ];

Promise.all([ userFirstObject.save(), userSecondObject.save(), userThirdObject.save() ])
.then(userResults => {

  // User 1 - Todo lists
  const userFirstTodoLists = createUserTodoLists(todoListsNames, todoListsDescriptions, 3, userResults[0]._id);
  // User 1 - Todo list 1 - Items
  const userFirstTodoListTasks = createUserTodoListTasks(todoListTasksNames, todoListTasksDescriptions, 3);

  // User 2 - Todo lists
  const userSecondTodoLists = createUserTodoLists(todoListsNames, todoListsDescriptions, 3, userResults[1]._id);
  // User 2 - Todo list 2 - Items
  const userSecondTodoListTasks = createUserTodoListTasks(todoListTasksNames, todoListTasksDescriptions, 3);

  // User 3 - Todo lists
  const userThirdTodoLists = createUserTodoLists(todoListsNames, todoListsDescriptions, 3, userResults[2]._id);
  // User 3 - Todo list 3 - Items
  const userThirdTodoListTasks = createUserTodoListTasks(todoListTasksNames, todoListTasksDescriptions, 3);

  Promise.all([
    userFirstTodoLists[0].save(), userFirstTodoLists[1].save(), userFirstTodoLists[2].save(),
    userFirstTodoListTasks[0].save(), userFirstTodoListTasks[1].save(), userFirstTodoListTasks[2].save(),

    userSecondTodoLists[0].save(), userSecondTodoLists[1].save(), userSecondTodoLists[2].save(),
    userSecondTodoListTasks[0].save(), userSecondTodoListTasks[1].save(), userSecondTodoListTasks[2].save(),

    userThirdTodoLists[0].save(), userThirdTodoLists[1].save(), userThirdTodoLists[2].save(),
    userThirdTodoListTasks[0].save(), userThirdTodoListTasks[1].save(), userThirdTodoListTasks[2].save()
  ]).then(results => {
    setupTodoLists(userResults[0], [ results[0], results[1], results[2] ]);
    setupTodoLists(userResults[1], [ results[6], results[7], results[8] ]);
    setupTodoLists(userResults[2], [ results[12], results[13], results[14] ]);

    setupTodoListTasks(results[0], [ results[3], results[4], results[5] ]);
    setupTodoListTasks(results[7], [ results[9], results[10], results[11] ]);
    setupTodoListTasks(results[14], [ results[15], results[16], results[17] ]);

    Promise.all([
      userResults[0].save(), userResults[1].save(), userResults[2].save(),
      results[0].save(), results[1].save(), results[2].save(),
      results[3].save(), results[4].save(), results[5].save(),
      results[6].save(), results[7].save(), results[8].save(),
      results[9].save(), results[10].save(), results[11].save(),
      results[12].save(), results[13].save(), results[14].save(),
      results[15].save(), results[16].save(), results[17].save()
    ]).then(results => {
      console.log("DONE");
      mongoose.disconnect();
    });
  });
}).catch(errors => {});

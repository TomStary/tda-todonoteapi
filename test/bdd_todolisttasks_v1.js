/// <reference types="chai" />
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const mongoose = require("mongoose");
const TodoList = mongoose.model('TodoList');
const TodoListTask = mongoose.model('TodoListTask');
const User = mongoose.model('User');

const should = chai.should();
chai.use(chaiHttp);

function dropCollections() {
  try {
    User.collection.drop().then(result => {}).catch(err => {});
  } catch (error) {
	   console.warn('Users collection may not exists!');
  }
  try {
    TodoList.collection.drop().then(result => {}).catch(err => {});
  } catch (error) {
	   console.warn('TodoLists collection may not exists!');
  }
  try {
    TodoListTask.collection.drop().then(result => {}).catch(err => {});
  } catch (error) {
     console.warn('TodoListTasks collection may not exists!');
  }
}

describe('TodoListTasks', () => {
  let userId = null;
  let apiToken = null;
  const todoListId = "59adXXXX27e9eXXXXbf65931";
  const todoListTaskId = "59XXXX1b9953b7XXXX99ce54";
  const userParams = { user: { fullname: "Demo Demo", email: "demo@demo.com", password: "demodemo" } };

  before((done) => {
    // Destroy all in the database
    dropCollections();

    // Create a user account & get a JWT auth token for API
    chai.request(server)
      .post('/api/v1/users')
      .send(userParams)
      .end((err, res) => {
        userId = res.body["user"]["id"];
        apiToken = res.body["user"]["token"];
        done();
      });
  });

  after((done) => {
    // Destroy all in the database
    dropCollections();
    done();
  });

  //
  // Test - GET /api/v1/todolists/:todoList/tasks
  //
  describe('GET /api/v1/todolists/:todoList/tasks', () => {
    let todoListLocalId = null;
    const todoListParams = { todoList: { name: "GET Lorem Ipsum List",
     description: "Lorem Ipsum List is simply dummy text of the printing and typesetting industry." } };
    const todoListTaskParams = { task: { name: "GET Lorem Ipsum Task",
     description: "Lorem Ipsum Task is simply dummy text of the printing and typesetting industry." } };

    before((done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a token error', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error 404 (Not found)', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a todo list and todo list tasks', (done) => {
      // INSERT SOURCE CODE
      done();
    });
  });

  //
  // Test - POST /api/v1/todolists/:todoList/tasks
  //
  describe('POST /api/v1/todolists/:todoList/tasks', () => {
    let todoListLocalId = null;
    const todoListParams = { todoList: { name: "POST Lorem Ipsum List",
     description: "POST Lorem Ipsum List is simply dummy text of the printing and typesetting industry." } };
    const todoListTaskParams = { task: { name: "POST Lorem Ipsum Task",
     description: "POST Lorem Ipsum Task is simply dummy text of the printing and typesetting industry." } };
    const todoListTaskNotValidParams = { task: { name: "", description: "POST tasks testing task" } };

    before((done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a token error', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error 404 (Not found)', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an todo list and todo list tasks', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - empty name field', (done) => {
      // INSERT SOURCE CODE
      done();
    });
  });

  //
  // Test - GET /api/v1/todolists/:todoList/tasks/:task
  //
  describe('GET /api/v1/todolists/:todoList/tasks/:task', () => {
    let todoListLocalId = null;
    let todoListTaskLocalId = null;
    let todoListTaskLocal = null;

    const todoListParams = { todoList: { name: "GET Lorem Ipsum List",
     description: "GET Lorem Ipsum List is simply dummy text of the printing and typesetting industry." } };
    const todoListTaskParams = { task: { name: "GET Lorem Ipsum Task",
     description: "GET Lorem Ipsum Task is simply dummy text of the printing and typesetting industry." } };

    before((done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a token error', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error 404 (Not found)', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a todo list task', (done) => {
      // INSERT SOURCE CODE
      done();
    });
  });

  //
  // Test - PUT /api/v1/todolists/:todoList/tasks/:task
  //
  describe('PUT /api/v1/todolists/:todoList/tasks/:task', () => {
    let todoListLocalId = null;
    let todoListTaskLocalId = null;
    let todoListTaskLocal = null;

    const todoListParams = { todoList: { name: "PUT Lorem Ipsum List",
     description: "PUT Lorem Ipsum List is simply dummy text of the printing and typesetting industry." } };
    const todoListTaskParams = { task: { name: "PUT Lorem Ipsum Task",
     description: "PUT Lorem Ipsum Task is simply dummy text of the printing and typesetting industry." } };
    const todoListTaskEditParams = { task: { name: "EDIT Lorem Ipsum Task",
     description: "EDIT Lorem Ipsum Task is simply dummy text of the printing and typesetting industry." } };

    before((done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a token error', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error 404 (Not found)', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a todo list task', (done) => {
      // INSERT SOURCE CODE
      done();
    });
  });

  //
  // Test - DELETE /api/v1/todolists/:todoList/tasks/:task
  //
  describe('DELETE /api/v1/todolists/:todoList/tasks/:task', () => {
    let todoListLocalId = null;
    let todoListTaskLocalId = null;
    let todoListTaskLocal = null;

    const todoListParams = { todoList: { name: "DELETE Lorem Ipsum List",
     description: "DELETE Lorem Ipsum List is simply dummy text of the printing and typesetting industry." } };
    const todoListTaskParams = { task: { name: "DELETE Lorem Ipsum Task",
     description: "DELETE Lorem Ipsum Task is simply dummy text of the printing and typesetting industry." } };

    before((done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a token error', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error 404 (Not found)', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should delete a todo list task', (done) => {
      // INSERT SOURCE CODE
      done();
    });
  });
});

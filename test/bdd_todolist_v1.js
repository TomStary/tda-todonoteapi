/// <reference types="chai" />
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const mongoose = require("mongoose");
const TodoList = mongoose.model('TodoList');
const TodoListTask = mongoose.model('TodoListTask');
const User = mongoose.model('User');
const appConfig = require("../config/env.json")[process.env.NODE_ENV];

mongoose.Promise = global.Promise;
mongoose.connect(appConfig["MONGO_URI"], appConfig["MONGO_OPTIONS"]);
mongoose.set('useCreateIndex', true);

const should = chai.should();
chai.use(chaiHttp);

function dropCollections() {
  try {
    Promise.resolve()
      .then(() => TodoList.remove({}))
      .then(() => User.remove({}))
      .then(() => TodoList.remove({}))
  } catch (error) {
	   console.warn('Error!', error);
  }
}

describe("TodoLists", () => {
  let userId = null;
  let apiToken = null;
  const todoListId = "59adXXXX27e9eXXXXbf65931";
  const todoListTaskId = "59XXXX1b9953b7XXXX99ce54";
  const userParams = { user: { fullname: "Demo Demo", email: "demo@demo.com", password: "demodemo" } };

  before(done => {
    // Destroy all in the database
    dropCollections();

    // Create a user account & get a JWT auth token for API
    chai.request(server)
      .post('/api/v1/users')
      .send(userParams)
      .end((err, res) => {
        res.should.have.status(200);
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
  // Test - GET /api/v1/todolists
  //
  describe('GET /api/v1/todolists', () => {
	  it('it should receive a token error', (done) => {
      chai.request(server)
        .post('/api/v1/todolists')
        .send()
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal({
            status: 401,
            message: 'Unauthorized',
            statusMessage: 'error',
            errors: { Token: 'No authorization token was found.' }
          });
          done();
        });
	  });

    it('it should receive a list of todo lists', (done) => {
      chai.request(server)
        .get('/api/v1/todolists')
        .set('Authorization', `Token ${apiToken}`)
        .send()
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("todoLists").and.to.be.a("array");
          done();
        });
	  });

    it('it should receive a list of todo lists (5 items)', (done) => {
      chai.request(server)
        .get('/api/v1/todolists')
        .set('Authorization', `Token ${apiToken}`)
        .send()
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("todoLists").and.to.be.a("array").to.have.lengthOf(5);
        })
	  });
  });

  //
  // Test - POST /api/v1/todolists
  //
  describe('POST /api/v1/todolists', () => {
    const todoListParams = { todoList: { name: "POST Lorem Ipsum",
     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." } };
    const todoListNotValidParams = { todoList: { name: "",
     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." } };

    it('it should receive a token error', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a new todo list', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - empty name field', (done) => {
      // INSERT SOURCE CODE
      done();
    });
  });

  //
  // Test - GET /api/v1/todolists/:todoList
  //
  describe('GET /api/v1/todolists/:todoList', () => {
    const todoListParams = { todoList: { name: "GET Lorem Ipsum",
     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." } };
    const todoListNotValidParams = { todoList: { name: "",
     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." } };

    it('it should receive a token error', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error 404', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a todo list', (done) => {
      // INSERT SOURCE CODE
      done();
    });
  });

  //
  // Test - PUT /api/v1/todolists/:todoList
  //
  describe('PUT /api/v1/todolists/:todoList', () => {
    const todoListParams = { todoList: { name: "Lorem Ipsum 2",
     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." } };
    const todoListNotValidParams = { todoList: { name: "",
     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." } };

    it('it should receive a token error', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error 404 (Not found)', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an updated todo list', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - empty name field', (done) => {
      // INSERT SOURCE CODE
      done();
    });
  });

  //
  // Test - DELETE /api/v1/todolists/:todoList
  //
  describe('DELETE /api/v1/todolists/:todoList', () => {
    const todoListParams = { todoList: { name: "DELETE Lorem Ipsum List",
     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." } };
    const todoListTaskParams = { task: { name: "DELETE Lorem Ipsum Task",
     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." } };

    it('it should receive a token error', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error 404 (Not found)', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a no content status', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a no content status (All childs)', (done) => {
      // INSERT SOURCE CODE
      done();
    });
  });
});

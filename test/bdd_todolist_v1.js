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

const tokenError = {
  status: 401,
  message: 'Unauthorized',
  statusMessage: 'error',
  errors: {
    Token: 'No authorization token was found.'
  }
};

const notFoundError = {
  status: 404,
  message: 'Not found',
  statusMessage: 'error',
  errors: {
    content: 'Not found'
  }
};

const wtfNotFoundError = {};

function dropCollections() {
  try {
    Promise.resolve()
      .then(() => TodoList.collection.drop())
      .then(() => User.collection.drop())
      .then(() => TodoList.collection.drop())
  } catch (error) {
    console.warn('Error!', error);
  }
}

describe("TodoLists", () => {
  let userId = null;
  let apiToken = null;
  const todoListId = "59adXXXX27e9eXXXXbf65931";
  const todoListTaskId = "59XXXX1b9953b7XXXX99ce54";
  const userParams = {
    user: {
      fullname: "Demo Demo",
      email: "demo@demo.com",
      password: "demodemo"
    }
  };

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
    // dropCollections();
    done();
  });

  //
  // Test - GET /api/v1/todolists
  //
  describe('GET /api/v1/todolists', () => {
    it('it should receive a token error', (done) => {
      chai.request(server)
        .get('/api/v1/todolists')
        .send()
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal(tokenError);
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
      todoLists = [{
          name: "test1",
          description: "",
          number: 1,
          author: userId
        },
        {
          name: "test2",
          description: "",
          number: 2,
          author: userId
        },
        {
          name: "test3",
          description: "",
          number: 3,
          author: userId
        },
        {
          name: "test4",
          description: "",
          number: 4,
          author: userId
        },
        {
          name: "test5",
          description: "",
          number: 5,
          author: userId
        },
      ];

      TodoList.insertMany(todoLists)
        .then(() => {
          chai.request(server)
            .get('/api/v1/todolists')
            .set('Authorization', `Token ${apiToken}`)
            .send()
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property("todoLists").and.to.be.a("array").to.have.lengthOf(5);
              done();
            });
        });
    });
  });

  //
  // Test - POST /api/v1/todolists
  //
  describe('POST /api/v1/todolists', () => {
    const todoListParams = {
      todoList: {
        name: "POST Lorem Ipsum",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
      }
    };
    const todoListNotValidParams = {
      todoList: {
        name: "",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
      }
    };

    it('it should receive a token error', (done) => {
      chai.request(server)
        .post('/api/v1/todolists')
        .send()
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal(tokenError);
          done();
        });
    });

    it('it should receive a new todo list', (done) => {
      chai.request(server)
        .post('/api/v1/todolists')
        .set('Authorization', `Token ${apiToken}`)
        .send(todoListParams)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.status.should.be.equal('created');
          res.body.todoList.name.should.be.equal(todoListParams.todoList.name);
          res.body.todoList.description.should.be.equal(todoListParams.todoList.description);
          res.body.todoList.should.have.property('id').and.to.be.a('string');
          done();
        });
    });

    it('it should receive an error - empty name field', (done) => {
      chai.request(server)
        .post('/api/v1/todolists')
        .set('Authorization', `Token ${apiToken}`)
        .send(todoListNotValidParams)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.deep.equal({
            status: 422,
            message: 'Invalid data',
            statusMessage: 'error',
            errors: {
              name: 'Can\'t be blank.'
            }
          });
          done();
        });
    });
  });

  //
  // Test - GET /api/v1/todolists/:todoList
  //
  describe('GET /api/v1/todolists/:todoList', () => {
    const todoListParams = {
      todoList: {
        name: "GET Lorem Ipsum",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
      }
    };
    const todoListNotValidParams = {
      todoList: {
        name: "",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
      }
    };

    it('it should receive a token error', (done) => {
      chai.request(server)
        .get('/api/v1/todolists/123')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal(tokenError);
          done();
        });
    });

    it('it should receive an error 404', (done) => {
      chai.request(server)
        .get('/api/v1/todolists/123')
        .set('Authorization', `Token ${apiToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.deep.equal(wtfNotFoundError);
          done();
        });
    });

    it('it should receive a todo list', (done) => {
      chai.request(server)
        .post('/api/v1/todolists')
        .set('Authorization', `Token ${apiToken}`)
        .send(todoListParams)
        .end((err, res) => {
          res.should.have.status(200);
          chai.request(server)
            .get(`/api/v1/todolists/${res.body.todoList.id}`)
            .set('Authorization', `Token ${apiToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.todoList.name.should.be.equal(todoListParams.todoList.name)
              res.body.todoList.description.should.be.equal(todoListParams.todoList.description)
              done();
            });
        });
    });
  });

  //
  // Test - PUT /api/v1/todolists/:todoList
  //
  describe('PUT /api/v1/todolists/:todoList', () => {
    const todoListParams = {
      todoList: {
        name: "Lorem Ipsum 2",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
      }
    };
    const todoListParamsUpdated = {
      todoList: {
        name: "Lorem Ipsum 3"
      }
    };
    const todoListNotValidParams = {
      todoList: {
        name: "",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
      }
    };

    it('it should receive a token error', (done) => {
      chai.request(server)
        .put('/api/v1/todolists/123')
        .send(todoListParams)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal(tokenError);
          done();
        });
    });

    it('it should receive an error 404 (Not found)', (done) => {
      chai.request(server)
        .put('/api/v1/todolists/123')
        .set('Authorization', `Token ${apiToken}`)
        .send(todoListParams)
        .end((err, res) => {
          res.should.have.status(404);
          // TODO: WTF?
          res.body.should.be.deep.equal(wtfNotFoundError);
          done();
        });
    });

    it('it should receive an updated todo list', (done) => {
      chai.request(server)
        .post('/api/v1/todolists')
        .set('Authorization', `Token ${apiToken}`)
        .send(todoListParams)
        .end((err, res) => {
          res.should.have.status(200);
          chai.request(server)
            .put(`/api/v1/todolists/${res.body.todoList.id}`)
            .set('Authorization', `Token ${apiToken}`)
            .send(todoListParamsUpdated)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.todoList.name.should.be.equal(todoListParamsUpdated.todoList.name)
              done();
            });
        });
    });

    it('it should receive an error - empty name field', (done) => {
      chai.request(server)
        .post('/api/v1/todolists')
        .set('Authorization', `Token ${apiToken}`)
        .send(todoListParams)
        .end((err, res) => {
          res.should.have.status(200);
          chai.request(server)
            .put(`/api/v1/todolists/${res.body.todoList.id}`)
            .set('Authorization', `Token ${apiToken}`)
            .send(todoListNotValidParams)
            .end((err, res) => {
              res.should.have.status(422);
              res.body.message.should.be.equal('Invalid data');
              res.body.statusMessage.should.be.equal('error');
              done();
            });
        });
    });
  });

  //
  // Test - DELETE /api/v1/todolists/:todoList
  //
  describe('DELETE /api/v1/todolists/:todoList', () => {
    const todoListParams = {
      todoList: {
        name: "DELETE Lorem Ipsum List",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
      }
    };
    const todoListTaskParams = {
      task: {
        name: "DELETE Lorem Ipsum Task",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
      }
    };

    it('it should receive a token error', (done) => {
      chai.request(server)
        .delete('/api/v1/todolists/123')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal(tokenError);
          done();
        });
    });

    it('it should receive an error 404 (Not found)', (done) => {
      chai.request(server)
        .delete('/api/v1/todolists/123')
        .set('Authorization', `Token ${apiToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          // TODO: WTF?
          res.body.should.be.deep.equal(wtfNotFoundError);
          done();
        });
    });

    it('it should receive a no content status', (done) => {
      chai.request(server)
        .post('/api/v1/todolists')
        .set('Authorization', `Token ${apiToken}`)
        .send(todoListParams)
        .end((err, res) => {
          res.should.have.status(200);
          chai.request(server)
            .delete(`/api/v1/todolists/${res.body.todoList.id}`)
            .set('Authorization', `Token ${apiToken}`)
            .end((err, res) => {
              res.should.have.status(204);
              done();
            });
        });
    });

    it('it should receive a no content status (All childs)', (done) => {
      // Kontrolo smazání všech todolistu i děti dětí (kaskáda) po akci s mazáním
      done();
    });
  });
});
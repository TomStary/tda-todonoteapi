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

const tokenError = {
  status: 401,
  message: 'Unauthorized',
  statusMessage: 'error',
  errors: {
    Token: 'No authorization token was found.'
  }
};

const dropCollections = async () => {
  try {
    await User.collection.drop().then(result => {}).catch(err => {});
  } catch (error) {
	  console.warn('Users collection may not exists!');
  }
  try {
    await TodoList.collection.drop().then(result => {}).catch(err => {});
  } catch (error) {
	  console.warn('TodoLists collection may not exists!');
  }
  try {
    await TodoListTask.collection.drop().then(result => {}).catch(err => {});
  } catch (error) {
    console.warn('TodoListTasks collection may not exists!');
  }
}

describe('TodoListTasks', () => {
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
    const todoListParams = {
      todoList: {
        name: "GET Lorem Ipsum List",
        description: "Lorem Ipsum List is simply dummy text of the printing and typesetting industry."
      }
    };
    const todoListTaskParams = {
      task: {
        name: "GET Lorem Ipsum Task",
        description: "Lorem Ipsum Task is simply dummy text of the printing and typesetting industry."
      }
    };

    before((done) => {
      let todoListModel = todoListParams.todoList;
      todoListModel.author = userId;
      TodoList.create(todoListModel)
        .then((todo) => {
          todoListLocalId = todo._id;
          let todoTaskModel = todoListTaskParams.task;
          todoTaskModel.todoList = todo;
          TodoListTask.create(todoTaskModel)
            .then(() => {
              done();
            });
        });
    });

    it('it should receive a token error', (done) => {
      chai.request(server)
        .get(`/api/v1/todolists/${todoListLocalId}/tasks`)
        .send()
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal(tokenError);
          done();
        });
    });

    it('it should receive an error 404 (Not found)', (done) => {
      chai.request(server)
        .get(`/api/v1/todolists/123/tasks`)
        .set('Authorization', `Token ${apiToken}`)
        .send()
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('it should receive a todo list and todo list tasks', (done) => {
      chai.request(server)
        .get(`/api/v1/todolists/${todoListLocalId}/tasks`)
        .set('Authorization', `Token ${apiToken}`)
        .send()
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('todoList');
          res.body.tasks.should.have.lengthOf(1);
          done();
        });
    });
  });

  //
  // Test - POST /api/v1/todolists/:todoList/tasks
  //
  describe('POST /api/v1/todolists/:todoList/tasks', () => {
    let todoListLocalId = null;
    const todoListParams = {
      todoList: {
        name: "POST Lorem Ipsum List",
        description: "POST Lorem Ipsum List is simply dummy text of the printing and typesetting industry."
      }
    };
    const todoListTaskParams = {
      task: {
        name: "POST Lorem Ipsum Task",
        description: "POST Lorem Ipsum Task is simply dummy text of the printing and typesetting industry."
      }
    };
    const todoListTaskNotValidParams = {
      task: {
        name: "",
        description: "POST tasks testing task"
      }
    };

    before((done) => {
      let todoListModel = todoListParams.todoList;
      todoListModel.author = userId;
      TodoList.create(todoListModel)
        .then((todo) => {
          todoListLocalId = todo._id;
          let todoTaskModel = todoListTaskParams.task;
          todoTaskModel.todoList = todo;
          TodoListTask.create(todoTaskModel)
            .then(() => {
              done();
            });
        });
    });

    it('it should receive a token error', (done) => {
      chai.request(server)
        .post(`/api/v1/todolists/${todoListLocalId}/tasks`)
        .send()
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal(tokenError);
          done();
        });
    });

    it('it should receive an error 404 (Not found)', (done) => {
      chai.request(server)
        .post(`/api/v1/todolists/123/tasks`)
        .set('Authorization', `Token ${apiToken}`)
        .send()
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('it should receive an todo list and todo list tasks', (done) => {
      chai.request(server)
        .post(`/api/v1/todolists/${todoListLocalId}/tasks`)
        .set('Authorization', `Token ${apiToken}`)
        .send(todoListTaskParams)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status').and.to.be.equal('created');
          done();
        });
    });

    it('it should receive an error - empty name field', (done) => {
      chai.request(server)
        .post(`/api/v1/todolists/${todoListLocalId}/tasks`)
        .set('Authorization', `Token ${apiToken}`)
        .send(todoListTaskNotValidParams)
        .end((err, res) => {
          res.should.have.status(422);
          done();
        });
    });
  });

  //
  // Test - GET /api/v1/todolists/:todoList/tasks/:task
  //
  describe('GET /api/v1/todolists/:todoList/tasks/:task', () => {
    let todoListLocalId = null;
    let todoListTaskLocalId = null;
    let todoListTaskLocal = null;

    const todoListParams = {
      todoList: {
        name: "GET Lorem Ipsum List",
        description: "GET Lorem Ipsum List is simply dummy text of the printing and typesetting industry."
      }
    };
    const todoListTaskParams = {
      task: {
        name: "GET Lorem Ipsum Task",
        description: "GET Lorem Ipsum Task is simply dummy text of the printing and typesetting industry."
      }
    };

    before((done) => {
      let todoListModel = todoListParams.todoList;
      todoListModel.author = userId;
      TodoList.create(todoListModel)
        .then((todo) => {
          todoListLocalId = todo._id;
          let todoTaskModel = todoListTaskParams.task;
          todoTaskModel.todoList = todo;
          TodoListTask.create(todoTaskModel)
            .then((task) => {
              todoListTaskLocalId = task._id;
              todoListTaskLocal = task;
              done();
            });
        });
    });

    it('it should receive a token error', (done) => {
      chai.request(server)
        .get(`/api/v1/todolists/${todoListLocalId}/tasks/${todoListTaskLocalId}`)
        .send()
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal(tokenError);
          done();
        });
    });

    it('it should receive an error 404 (Not found)', (done) => {
      chai.request(server)
        .get(`/api/v1/todolists/${todoListLocalId}/tasks/123`)
        .set('Authorization', `Token ${apiToken}`)
        .send()
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('it should receive a todo list task', (done) => {
      chai.request(server)
        .get(`/api/v1/todolists/${todoListLocalId}/tasks/${todoListTaskLocalId}`)
        .set('Authorization', `Token ${apiToken}`)
        .send()
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('task').and.to.have.property('id', todoListTaskLocalId.toString());
          done();
        });
    });
  });

  //
  // Test - PUT /api/v1/todolists/:todoList/tasks/:task
  //
  describe('PUT /api/v1/todolists/:todoList/tasks/:task', () => {
    let todoListLocalId = null;
    let todoListTaskLocalId = null;
    let todoListTaskLocal = null;

    const todoListParams = {
      todoList: {
        name: "PUT Lorem Ipsum List",
        description: "PUT Lorem Ipsum List is simply dummy text of the printing and typesetting industry."
      }
    };
    const todoListTaskParams = {
      task: {
        name: "PUT Lorem Ipsum Task",
        description: "PUT Lorem Ipsum Task is simply dummy text of the printing and typesetting industry."
      }
    };
    const todoListTaskEditParams = {
      task: {
        name: "EDIT Lorem Ipsum Task",
        description: "EDIT Lorem Ipsum Task is simply dummy text of the printing and typesetting industry."
      }
    };

    before((done) => {
      let todoListModel = todoListParams.todoList;
      todoListModel.author = userId;
      TodoList.create(todoListModel)
        .then((todo) => {
          todoListLocalId = todo._id;
          let todoTaskModel = todoListTaskParams.task;
          todoTaskModel.todoList = todo;
          TodoListTask.create(todoTaskModel)
            .then((task) => {
              todoListTaskLocalId = task._id;
              todoListTaskLocal = task;
              done();
            });
        });
    });

    it('it should receive a token error', (done) => {
      chai.request(server)
        .get(`/api/v1/todolists/${todoListLocalId}/tasks/${todoListTaskLocalId}`)
        .send()
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal(tokenError);
          done();
        });
    });

    it('it should receive an error 404 (Not found)', (done) => {
      chai.request(server)
        .put(`/api/v1/todolists/${todoListLocalId}/tasks/123`)
        .set('Authorization', `Token ${apiToken}`)
        .send()
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('it should receive a todo list task', (done) => {
      chai.request(server)
        .put(`/api/v1/todolists/${todoListLocalId}/tasks/${todoListTaskLocalId}`)
        .set('Authorization', `Token ${apiToken}`)
        .send(todoListTaskEditParams)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status', 'updated');
          res.body.should.have.property('task').and.to.have.property('description', todoListTaskEditParams.task.description);
          done();
        });
    });
  });

  //
  // Test - DELETE /api/v1/todolists/:todoList/tasks/:task
  //
  describe('DELETE /api/v1/todolists/:todoList/tasks/:task', () => {
    let todoListLocalId = null;
    let todoListTaskLocalId = null;
    let todoListTaskLocal = null;

    const todoListParams = {
      todoList: {
        name: "DELETE Lorem Ipsum List",
        description: "DELETE Lorem Ipsum List is simply dummy text of the printing and typesetting industry."
      }
    };
    const todoListTaskParams = {
      task: {
        name: "DELETE Lorem Ipsum Task",
        description: "DELETE Lorem Ipsum Task is simply dummy text of the printing and typesetting industry."
      }
    };

    before((done) => {
      let todoListModel = todoListParams.todoList;
      todoListModel.author = userId;
      TodoList.create(todoListModel)
        .then((todo) => {
          todoListLocalId = todo._id;
          let todoTaskModel = todoListTaskParams.task;
          todoTaskModel.todoList = todo;
          TodoListTask.create(todoTaskModel)
            .then((task) => {
              todoListTaskLocalId = task._id;
              todoListTaskLocal = task;
              done();
            });
        });
    });

    it('it should receive a token error', (done) => {
      chai.request(server)
        .delete(`/api/v1/todolists/${todoListLocalId}/tasks/${todoListTaskLocalId}`)
        .send()
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal(tokenError);
          done();
        });
    });

    it('it should receive an error 404 (Not found)', (done) => {
      chai.request(server)
        .delete(`/api/v1/todolists/${todoListLocalId}/tasks/123`)
        .set('Authorization', `Token ${apiToken}`)
        .send()
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('it should delete a todo list task', (done) => {
      chai.request(server)
        .delete(`/api/v1/todolists/${todoListLocalId}/tasks/${todoListTaskLocalId}`)
        .set('Authorization', `Token ${apiToken}`)
        .send()
        .end((err, res) => {
          res.should.have.status(204);
          TodoListTask.findById(todoListTaskLocalId)
            .then((result) => {
              should.equal(null, result);
              done();
            });
        });
    });
  });
});
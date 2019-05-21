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

describe('Users', () => {
  let userId = null;
  let apiToken = null;

  const errorMessageEmailTakenField = "Is already taken.";
  const errorMessageBlankField = "Can't be blank.";

  const userParams = { user: { fullname: "Demo Demo", email: "demo@demo.com", password: "demodemo" } };
  const userEditParams = { user: { fullname: "Edit Edit", email: "edit@edit.com", password: "editedit" } };
  const userSecondParams = { user: { fullname: "Demo Demo", email: "seconddemo@demo.com", password: "abc123abc" } };

  before((done) => {
    // Destroy all in the database
    dropCollections();

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
  // Test - GET /api/v1/user
  //
  describe('GET /api/v1/user', () => {
    it('it should receive a token error', (done) => {
      // INSERT SOURCE CODE
      done();
	  });

    it('it should receive a user account info', (done) => {
      // INSERT SOURCE CODE
      done();
    });
  });

  //
  // Test - POST /api/v1/users/login
  //
  describe('POST /api/v1/users/login', () => {
    it('it should receive an error - empty user values', (done) => {
      // INSERT SOURCE CODE
      done();
	  });

    it('it should receive an error - empty user values', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - empty user values email and password', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - empty user values email', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - empty user values password', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - email or password is invalid', (done) => {
      // INSERT SOURCE CODE
      done();
    });
  });

  //
  // Test - PUT /api/v1/user
  //
  describe('PUT /api/v1/user', () => {
    it('it should receive a token error', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - current password is not correct #1', (done) => {
      // INSERT SOURCE CODE
      done();
	  });

    it('it should receive an error - current password is not correct #2', (done) => {
      // INSERT SOURCE CODE
      done();
	  });

    it('it should receive an error - current password is not correct #3', (done) => {
      // INSERT SOURCE CODE
      done();
	  });

    it('it should receive an error - fullname value is empty', (done) => {
      // INSERT SOURCE CODE
      done();
	  });

    it('it should receive an error - password value is empty', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a updated fullname', (done) => {
      // INSERT SOURCE CODE
      done();
	  });

    it('it should receive a updated password', (done) => {
      // INSERT SOURCE CODE
      done();
	  });
  });

  //
  // Test - POST /api/v1/users
  //
  describe('POST /api/v1/users', () => {
    it('it should receive an error - empty user values', (done) => {
      // INSERT SOURCE CODE
      done();
	  });

    it('it should receive an error - empty field values fullname, email, and password', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - empty field values email and password', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - empty field values fullname and password', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - empty field values fullname and email', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - empty field value fullname', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - empty field value email', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - empty field value password', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive a new user account', (done) => {
      // INSERT SOURCE CODE
      done();
    });

    it('it should receive an error - duplicit email account', (done) => {
      // INSERT SOURCE CODE
      done();
    });
  });
});

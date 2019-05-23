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


const blankError = "Can\'t be blank.";

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
      chai.request(server)
        .get('/api/v1/user')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal(tokenError);
          done();
        });
    });

    it('it should receive a user account info', (done) => {
      chai.request(server)
        .get(`/api/v1/user`)
        .set('Authorization', `Token ${apiToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.user.should.have.property('id');
          res.body.user.should.have.property('token');
          res.body.user.should.have.property('fullname').equal(userParams.user.fullname);
          res.body.user.should.have.property('email').equal(userParams.user.email);
          done();
        });
    });
  });

  //
  // Test - POST /api/v1/users/login
  //
  describe('POST /api/v1/users/login', () => {
    it('it should receive an error - empty user values', (done) => {
      chai.request(server)
        .post(`/api/v1/users/login`)
        .set('Authorization', `Token ${apiToken}`)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          done();
        });
	  });

    it('it should receive an error - empty user values email and password', (done) => {
      chai.request(server)
        .post(`/api/v1/users/login`)
        .set('Authorization', `Token ${apiToken}`)
        .send({ user: {}})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('email').to.be.equal(blankError);
          res.body.errors.should.have.property('password').to.be.equal(blankError);
          done();
        });
	  });

    it('it should receive an error - empty user values email', (done) => {
      chai.request(server)
        .post(`/api/v1/users/login`)
        .set('Authorization', `Token ${apiToken}`)
        .send({ user: { email: "", password: "demodemo" }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('email').to.be.equal(blankError);
          res.body.errors.should.not.have.property('password');
          done();
        });
	  });

    it('it should receive an error - empty user values password', (done) => {
      chai.request(server)
        .post(`/api/v1/users/login`)
        .set('Authorization', `Token ${apiToken}`)
        .send({ user: { email: "demo@demo.com", password: "" }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.not.have.property('email');
          res.body.errors.should.have.property('password').to.be.equal(blankError);
          done();
        });
	  });

    it('it should receive an error - email or password is invalid', (done) => {
      chai.request(server)
        .post(`/api/v1/users/login`)
        .set('Authorization', `Token ${apiToken}`)
        .send({ user: { email: "hellokitty@fit.cvut.cz", password: "trollolololololol" }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('email or password').to.be.equal('is invalid');
          done();
        });
	  });
  });

  //
  // Test - PUT /api/v1/user
  //
  describe('PUT /api/v1/user', () => {
    it('it should receive a token error', (done) => {
      chai.request(server)
        .put('/api/v1/user')
        .send(userEditParams)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal(tokenError);
          done();
        });
    });

    it('it should receive an error - current password is not correct #1', (done) => {
      chai.request(server)
        .put(`/api/v1/user`)
        .set('Authorization', `Token ${apiToken}`)
        .send({ user: {}})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('currentPassword').to.be.equal(blankError);
          done();
        });
	  });

    it('it should receive an error - current password is not correct #2', (done) => {
      chai.request(server)
        .put(`/api/v1/user`)
        .set('Authorization', `Token ${apiToken}`)
        .send({ user: { currentPassword: '' }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('currentPassword').to.be.equal(blankError);
          done();
        });
	  });

    it('it should receive an error - current password is not correct #3', (done) => {
      chai.request(server)
        .put(`/api/v1/user`)
        .set('Authorization', `Token ${apiToken}`)
        .send({ user: { currentPassword: '💩' }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('currentPassword').to.be.equal('Current password isn\'t correct.');
          done();
        });
	  });

    it('it should receive an error - fullname value is empty', (done) => {
      chai.request(server)
        .put(`/api/v1/user`)
        .set('Authorization', `Token ${apiToken}`)
        .send({ user: { currentPassword: userParams.user.password, fullname: '' }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('fullname').to.be.equal(blankError);
          done();
        });
	  });

    it('it should receive an error - password value is empty', (done) => {
      chai.request(server)
        .put(`/api/v1/user`)
        .set('Authorization', `Token ${apiToken}`)
        .send({ user: { currentPassword: userParams.user.password, password: '' }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('password').to.be.equal(blankError);
          done();
        });
	  });

    it('it should receive a updated fullname', (done) => {
      chai.request(server)
        .put(`/api/v1/user`)
        .set('Authorization', `Token ${apiToken}`)
        .send({ user: { currentPassword: userParams.user.password, password: userParams.user.password, fullname: userEditParams.user.fullname }})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.status.should.be.equal('updated');
          res.body.user.should.have.property('fullname').to.be.equal(userEditParams.user.fullname);
          done();
        });
	  });

    it('it should receive a updated password', (done) => {
      chai.request(server)
        .put(`/api/v1/user`)
        .set('Authorization', `Token ${apiToken}`)
        .send({ user: { currentPassword: userParams.user.password, password: userEditParams.user.password, fullname: userParams.user.fullname }})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.status.should.be.equal('updated');
          User.findById(res.body.user.id)
            .then((user) => {
              chai.expect(user.validPassword(userEditParams.user.password)).to.be.true;
              done();
            })
            .catch(done)
        });
	  });
  });

  //
  // Test - POST /api/v1/users
  //
  describe('POST /api/v1/users', () => {
    it('it should receive an error - empty user values', (done) => {
      chai.request(server)
        .post(`/api/v1/users`)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('fullname').to.be.equal(blankError);
          res.body.errors.should.have.property('email').to.be.equal(blankError);
          res.body.errors.should.have.property('password').to.be.equal(blankError);
          done();
        });
	  });

    it('it should receive an error - empty field values fullname, email, and password', (done) => {
      chai.request(server)
        .post(`/api/v1/users`)
        .send({ user: { }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('fullname').to.be.equal(blankError);
          res.body.errors.should.have.property('email').to.be.equal(blankError);
          res.body.errors.should.have.property('password').to.be.equal(blankError);
          done();
        });
	  });

    it('it should receive an error - empty field values email and password', (done) => {
      chai.request(server)
        .post(`/api/v1/users`)
        .send({ user: { fullname: userSecondParams.user.fullname }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('email').to.be.equal(blankError);
          res.body.errors.should.not.have.property('fullname');
          res.body.errors.should.have.property('password').to.be.equal(blankError);
          done();
        });
	  });

    it('it should receive an error - empty field values fullname and password', (done) => {
      chai.request(server)
        .post(`/api/v1/users`)
        .send({ user: { email: userSecondParams.user.email }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.not.have.property('email');
          res.body.errors.should.have.property('fullname').to.be.equal(blankError);
          res.body.errors.should.have.property('password').to.be.equal(blankError);
          done();
        });
	  });

    it('it should receive an error - empty field values fullname and email', (done) => {
      chai.request(server)
        .post(`/api/v1/users`)
        .send({ user: { password: userSecondParams.user.password }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('email').to.be.equal(blankError);
          res.body.errors.should.have.property('fullname').to.be.equal(blankError);
          res.body.errors.should.not.have.property('password');
          done();
        });
	  });

    it('it should receive an error - empty field value fullname', (done) => {
      chai.request(server)
        .post(`/api/v1/users`)
        .send({ user: { email: userSecondParams.user.email, password: userSecondParams.user.password }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.not.have.property('email');
          res.body.errors.should.have.property('fullname').to.be.equal(blankError);
          res.body.errors.should.not.have.property('password');
          done();
        });
	  });

    it('it should receive an error - empty field value email', (done) => {
      chai.request(server)
        .post(`/api/v1/users`)
        .send({ user: { fullname: userSecondParams.user.fullname, password: userSecondParams.user.password }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('email').to.be.equal(blankError);
          res.body.errors.should.not.have.property('fullname');
          res.body.errors.should.not.have.property('password');
          done();
        });
	  });

    it('it should receive an error - empty field value password', (done) => {
      chai.request(server)
        .post(`/api/v1/users`)
        .send({ user: { email: userSecondParams.user.email, fullname: userSecondParams.user.fullname }})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.not.have.property('email');
          res.body.errors.should.not.have.property('fullname');
          res.body.errors.should.have.property('password').to.be.equal(blankError);
          done();
        });
	  });

    it('it should receive a new user account', (done) => {
      chai.request(server)
        .post(`/api/v1/users`)
        .send(userSecondParams)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.user.should.have.property('id');
          res.body.user.should.have.property('token');
          res.body.user.should.have.property('fullname').equal(userSecondParams.user.fullname);
          res.body.user.should.have.property('email').equal(userSecondParams.user.email);
          done();
        });
	  });

    it('it should receive an error - duplicit email account', (done) => {
      chai.request(server)
        .post(`/api/v1/users`)
        .send(userParams)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.deep.equal({
            status: 422,
            message: 'Invalid data',
            statusMessage: 'error',
            errors: { email: 'Is already taken.' }
          })
          done();
        });
	  });
  });
});

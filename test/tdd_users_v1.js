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
  // Test - DELETE /api/v1/user/:userId
  //
  describe('DELETE /api/v1/user/:userId', () => {
    it('should receive a token error', (done) => {
      chai.request(server)
        .delete(`/api/v1/user/${userId}`)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.deep.equal(tokenError);
          done();
        });
    });

    it('should receive an error - delete current user', (done) => {
      chai.request(server)
        .delete(`/api/v1/user/${userId}`)
        .set('Authorization', `Token ${apiToken}`)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('user').to.be.equal('Can\'t delete current user.');
          done();
        });
    });

    it('should receive an error - delete unknown user', (done) => {
      chai.request(server)
        .delete(`/api/v1/user/123`)
        .set('Authorization', `Token ${apiToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.deep.equal({});
          done();
        });
    });

    it('should delete existing user', (done) => {
      const userObject = new User({
        fullname: userSecondParams.user.fullname,
        email: userSecondParams.user.email
      });
      userObject.setPassword(userSecondParams.user.password);

      userObject.save()
        .then((newUser) => {
          if (newUser) {
            return chai.request(server)
              .delete(`/api/v1/user/${newUser.id}`)
              .set('Authorization', `Token ${apiToken}`)
              .end((err, res) => {
                res.should.have.status(204);
                done();
              });
          }
          throw new Error('Can\'t insert new user.');
        })
        .catch(done)
    });
  });
});

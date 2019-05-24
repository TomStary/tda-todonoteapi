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

    describe('GET /api/v1/todolists', () => {
        // This is more covered in BDD tests, not need to do same thing twice.
        it('Should check if url exists, and return 200', (done) => {
            chai.request(server)
                .get('/api/v1/todolists')
                .set('Authorization', `Token ${apiToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('POST /api/v1/todolists', () => {
        const todoListParams = {
            todoList: {
                name: "POST Lorem Ipsum",
                description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            }
        };

        before((done) => {
            let todoListModel = todoListParams.todoList;
            todoListModel.author = userId;
            TodoList.create(todoListModel)
                .then((todo) => {
                    todoListLocalId = todo._id;
                    done();
                });
        });

        it('There should not be problem to create two todolists with same name', (done) => {
            // This should maybe be changed in next version, because it is against logic of this application
            // which uses name of todolist as index in DB.
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
    });

    describe('GET /api/v1/todolists/:todoList', () => {
        let todoListLocalId;
        const todoListParams = {
            todoList: {
                name: "POST Lorem Ipsum",
                description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            }
        };

        before((done) => {
            let todoListModel = todoListParams.todoList;
            todoListModel.author = userId;
            TodoList.create(todoListModel)
                .then((todo) => {
                    todoListLocalId = todo._id;
                    done();
                });
        });

        it('test todolist get', (done) => {
            chai.request(server)
                .get(`/api/v1/todolists/${todoListLocalId}`)
                .set('Authorization', `Token ${apiToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.todoList.name.should.be.equal(todoListParams.todoList.name)
                    res.body.todoList.description.should.be.equal(todoListParams.todoList.description)
                    done();
                });
        });

        it('it should not receive item, after it is deleted', (done) => {
            chai.request(server)
                .get(`/api/v1/todolists/${todoListLocalId}`)
                .set('Authorization', `Token ${apiToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.todoList.name.should.be.equal(todoListParams.todoList.name)
                    res.body.todoList.description.should.be.equal(todoListParams.todoList.description)
                    TodoList.deleteOne({
                            _id: todoListLocalId
                        })
                        .then((resp) => {
                            chai.request(server)
                                .get(`/api/v1/todolists/${todoListLocalId}`)
                                .set('Authorization', `Token ${apiToken}`)
                                .end((err, res) => {
                                    res.should.have.status(404);
                                    done();
                                });
                        });
                });
        });
    });

    describe('PUT /api/v1/todolists/:todoList', () => {
        let todoListLocalId;
        let todoListLocalId1;
        const todoListParams = {
            todoList: {
                name: "PUT Lorem Ipsum",
                description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            }
        };

        const todoListParams1 = {
            todoList: {
                name: "POST Lorem Ipsum",
                description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            }
        };

        before((done) => {
            let todoListModel = todoListParams.todoList;
            let todoListModel1 = todoListParams1.todoList;
            todoListModel.author = userId;
            todoListModel1.author = userId;
            TodoList.insertMany([todoListModel, todoListModel1])
                .then((todo) => {
                    todoListLocalId = todo[0]._id;
                    todoListLocalId1 = todo[1]._id;
                    done();
                });
        });

        it('it should update list to same name as another one', (done) => {
            chai.request(server)
                .put(`/api/v1/todolists/${todoListLocalId}`)
                .set('Authorization', `Token ${apiToken}`)
                .send(todoListParams1)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.todoList.name.should.be.equal(todoListParams1.todoList.name)
                    done();
                });
        })
    });
    describe('DELETE /api/v1/todolists/:todoList', () => {
        let todoListLocalId = null;
        let todoListTaskId = null;
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
                            todoListTaskId = task._id;
                            done();
                        });
                });
        });


        it('it should receive a no content status (All childs)', (done) => {
            // Kontrolo smazání všech todolistu i děti dětí (kaskáda) po akci s mazáním
            chai.request(server)
                .delete(`/api/v1/todolists/${todoListLocalId}`)
                .set('Authorization', `Token ${apiToken}`)
                .end((err, res) => {
                    res.should.have.status(204);
                    TodoList.findById(todoListLocalId).then((result) => {
                        should.equal(null, result);
                        TodoListTask.findById(todoListTaskId).then((taskRes) => {
                            should.equal(null, taskRes);
                            done();
                        });
                    });
                });
        });
    });
});
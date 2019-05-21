const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

const TodoList = mongoose.model('TodoList');
const TodoListTask = mongoose.model('TodoListTask');
const User = mongoose.model('User');
const auth = require('../../auth');

router.param('todoList', (req, res, next, id) => {
  TodoList.findOne({ _id: id }, (error, result) => {
    if(error || !result) {
      req.todoList = null;
    } else {
      req.todoList = result;
    }
    return next();
  }).populate('author');
});

router.param('task', (req, res, next, id) => {
  TodoListTask.findById(id, (error, result) => {
    if(error || !result) {
      req.todoListTask = null;
    } else {
      req.todoListTask = result;
    }
    return next();
  });
});

//
// GET /
//
router.get('/', auth.required, (req, res, next) => {
  let limit = 20;
  let offset = 0;
  const query = {};

  if(typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined') {
    offset = req.query.offset;
  }

  Promise.all([ req.payload ? User.findById(req.payload.id) : null ])
  .then((results) => {
    const author = results[0];
    if(author == null) { return res.sendStatus(403); }
    query.author = author._id;

    return Promise.all([ TodoList.find(query).limit(Number(limit))
        .skip(Number(offset)).sort({ createdAt: 'desc' })
        .populate('author').exec(),
      TodoList.countDocuments(query).exec()
    ]).then((results) => {
      const todoLists = results[0];
      const todoListsCount = results[1];

      return res.json({ todoLists: todoLists.map((todoList) => {
          return todoList.toJSON();
        }), count: todoListsCount, limit: limit, offset: offset
      });
    });
  }).catch(next);
});

//
// POST /
//
router.post('/', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) {
      return res.sendStatus(403);
    }

    const todoList = new TodoList(req.body.todoList);
    user.addTodoList(todoList);

    return Promise.all([ todoList.save(), user.save() ]).then((results) => {
      return res.json({ status: "created", todoList: todoList.toJSON() });
    }).catch(next);
  });
});

//
// GET /:todoList
//
router.get('/:todoList', auth.required, (req, res, next) => {
  if(req.todoList == null) {
    return res.sendStatus(404);
  }

  return Promise.all([
    TodoList.find({ _id: req.todoList._id, author: req.payload.id }).populate('author').exec(),
    req.payload ? User.findById(req.payload.id) : null ]).then((results) => {
      const todoListObject = results[0];
      const userObject = results[1];

      if(userObject == null) {
        return res.sendStatus(403);
      }

      if(todoListObject == null || todoListObject.length < 1) {
        return res.sendStatus(404);
      }

      return res.json({ todoList: todoListObject[0] });
    }).catch(next);
});

//
// PUT /:todoList
//
router.put('/:todoList', auth.required, (req, res, next) => {
  if(req.todoList == null) {
    return res.sendStatus(404);
  }

  if(req.todoList.author._id.toString() === req.payload.id.toString()) {
    if(typeof req.body.todoList.name !== 'undefined') {
      req.todoList.name = req.body.todoList.name;
    }

    if(typeof req.body.todoList.description !== 'undefined') {
      req.todoList.description = req.body.todoList.description;
    }

    req.todoList.save().then((todoList) => {
      return res.json({ status: "updated", todoList: req.todoList.toJSON() });
    }).catch(next);
  } else {
    return res.sendStatus(403);
  }
});

//
// DELETE /:todoList
//
router.delete('/:todoList', auth.required, (req, res, next) => {
  if(req.todoList == null) {
    return res.sendStatus(404);
  }

  if(req.todoList.author._id.toString() === req.payload.id.toString()) {
    return req.todoList.remove().then(() => {
      return res.sendStatus(204);
    });
  } else {
    return res.sendStatus(403);
  }
});

//
// GET /:todoList/tasks
//
router.get('/:todoList/tasks', auth.required, (req, res, next) => {
  if(req.todoList == null) {
    return res.sendStatus(404);
  }

  if(req.todoList.author._id.toString() === req.payload.id.toString()) {
    const query = {};
    query.todoList = req.todoList._id;

    return Promise.all([
      TodoListTask.find(query).sort({ createdAt: 'desc' }).exec(),
      TodoListTask.countDocuments(query).exec()
    ]).then((results) => {
      const todoListTasks = results[0];
      const todoListTasksCount = results[1];

      return res.json({ todoList: req.todoList.toJSON(),
        tasks: todoListTasks.map((todoListTask) => {
          return todoListTask.toJSON();
        }), count: todoListTasksCount
      });
    });
  } else {
    return res.sendStatus(403);
  }
});

//
// POST /:todoList/tasks
//
router.post('/:todoList/tasks', auth.required, (req, res, next) => {
  if(req.todoList == null) {
    return res.sendStatus(404);
  }

  User.findById(req.payload.id).then((user) => {
    if(!user || req.todoList.author._id.toString() !== req.payload.id.toString()) {
      return res.sendStatus(403);
    }

    const task = new TodoListTask(req.body.task);
    req.todoList.addTask(task);

    return Promise.all([ task.save(), req.todoList.save() ]).then((results) => {
        res.json({ status: "created", task: task.toJSON() });
    });
  }).catch(next);
});

//
// GET /:todoList/tasks/:task
//
router.get('/:todoList/tasks/:task', auth.required, (req, res, next) => {
  if(req.payload == null || req.payload.id == null) {
    return res.sendStatus(403);
  }

  if(req.todoList == null || req.todoListTask == null) {
    return res.sendStatus(404);
  }

  if(req.todoListTask.todoList.toString() === req.todoList._id.toString() &&
    req.todoList.author._id.toString() === req.payload.id.toString()) {
    return res.json({ task: req.todoListTask.toJSON() });
  } else {
    return res.sendStatus(403);
  }
});

//
// PUT /:todoList/tasks/:task
//
router.put('/:todoList/tasks/:task', auth.required, (req, res, next) => {
  if(req.payload == null || req.payload.id == null) {
    return res.sendStatus(403);
  }

  if(req.todoList == null || req.todoListTask == null) {
    return res.sendStatus(404);
  }

  if(req.todoListTask.todoList.toString() === req.todoList._id.toString() &&
    req.todoList.author._id.toString() === req.payload.id.toString()) {

    if(typeof req.body.task.name !== 'undefined') {
      req.todoListTask.name = req.body.task.name;
    }

    if(typeof req.body.task.description !== 'undefined') {
      req.todoListTask.description = req.body.task.description;
    }

    if(typeof req.body.task.dueDate !== 'undefined') {
      req.todoListTask.dueDate = req.body.task.dueDate;
    }

    if(typeof req.body.task.completed !== 'undefined') {
      req.todoListTask.completed = req.body.task.completed;
    }

    req.todoListTask.save().then((todoListTask) => {
      return res.json({ status: "updated", task: req.todoListTask.toJSON() });
    }).catch(next);
  } else {
    return res.sendStatus(403);
  }
});

//
// DELETE /:todoList/tasks/:task
//
router.delete('/:todoList/tasks/:task', auth.required, (req, res, next) => {
  if(req.payload == null || req.payload.id == null) {
    return res.sendStatus(403);
  }

  if(req.todoList == null || req.todoListTask == null) {
    return res.sendStatus(404);
  }

  if(req.todoListTask.todoList.toString() === req.todoList._id.toString() &&
    req.todoList.author._id.toString() === req.payload.id.toString()) {
      req.todoList.tasks.remove(req.todoListTask._id);
      req.todoList.save()
        .then(TodoListTask.find({ _id: req.todoListTask._id }).remove().exec())
        .then(() => { res.sendStatus(204); });
  } else {
    return res.sendStatus(403);
  }
});

module.exports = router;

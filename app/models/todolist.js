const mongoose = require('mongoose');

const TodoListSchema = new mongoose.Schema({
  name: { type: String, required: [ true, "Can't be blank." ], index: true },
  description: { type: String, default: "" },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TodoListTask' }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

TodoListSchema.pre('remove', function(next) {
    this.model('TodoListTask').remove({ todoList: this._id }, next);
});

TodoListSchema.methods.toJSON = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    author: this.author.toJSON(),
    createdAt: this.createdAt
  };
};

TodoListSchema.methods.addTask = function(task) {
  this.tasks.push(task);
  task.todoList = this;
};

module.exports = mongoose.model('TodoList', TodoListSchema);

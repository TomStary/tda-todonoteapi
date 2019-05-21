const mongoose = require('mongoose');

const TodoListTaskSchema = new mongoose.Schema({
  name: { type: String, required: [ true, "Can't be blank." ], index: true },
  description: { type: String, default: "" },
  dueDate: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  todoList: { type: mongoose.Schema.Types.ObjectId, ref: 'TodoList' },
}, { timestamps: true });

TodoListTaskSchema.methods.toJSON = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    dueDate: this.dueDate,
    completed: this.completed,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('TodoListTask', TodoListTaskSchema);

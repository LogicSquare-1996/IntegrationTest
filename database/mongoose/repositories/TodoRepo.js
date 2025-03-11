const Todo = require("../models/todo")
const User = require("../models/user")

const TodoRepo = {
    createTodo: async (title, description, priority, status, dueDate, userId) => {
        try {
          const todo = new Todo({
            title,
            description,
            priority: priority || "medium",
            status: status || "pending",
            dueDate,
            user: userId,
          });
    
          await todo.save();
          return todo;
        } catch (error) {
          throw new Error(error.message);
        }
      },
}

module.exports = TodoRepo

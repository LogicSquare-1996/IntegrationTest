const { get } = require("lodash");
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

      getAllTodos: async (usrId) => {
        try {
            // Find all todos for the user where isDeleted is false (if you want to filter out deleted todos)
            const todos = await Todo.find({
                user: usrId,      // Filter by the userId
                isDeleted: false  // Assuming there's an 'isDeleted' field that marks todos as deleted
            });
    
            // Return the found todos
            return todos;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    getTodoById: async (todoId, userId) => {
      try {
          const todo = await Todo.findOne({ _id: todoId, user: userId, isDeleted: false });
          if (!todo) throw new Error("Todo not found");
          return todo;
      } catch (error) {
          throw new Error(error.message);
      }
  },

}

module.exports = TodoRepo

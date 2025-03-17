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

  updateTodo: async (todoId, todoData, userId) => {
    try {

        if(!todoData.title) throw new Error("Title is required")
        if(!todoData.description) throw new Error("Description is required")
        const todo = await Todo.findOne({ _id: todoId, user: userId, isDeleted: false });
        if (!todo) throw new Error("Todo not found");
        
        
        todo.title = todoData.title || todo.title;
        todo.description = todoData.description || todo.description;
        todo.priority = todoData.priority || todo.priority;
        todo.status = todoData.status || todo.status;
        todo.dueDate = todoData.dueDate || todo.dueDate;
        await todo.save();
        return todo;
    } catch (error) {
        throw new Error(error.message);
    }
},
deleteTodo: async (todoId, userId) => {
    try {
        const todo = await Todo.findOne({ _id: todoId, user: userId, isDeleted: false });
        if (!todo) throw new Error("Todo not found");
        // if(todo.isDeleted) throw new Error("Todo already deleted")
        todo.isDeleted = true;
        await todo.save();
        return todo;
    } catch (error) {
        throw new Error(error.message);
    }
},

updateTodoStatus: async (todoId, todoData, userId) => {
    try {
        if(!todoData.status) throw new Error("Status is required")
        const todo = await Todo.findOne({ _id: todoId, user: userId, isDeleted: false });
        if(todoData.status=== todo.status) throw new Error("Status can't be same")
        
        if (!todo) throw new Error("Todo not found");
        todo.status = todoData.status ||todo.status;
        await todo.save();
        return todo;
    } catch (error) {
        throw new Error(error.message);
    }
},

}

module.exports = TodoRepo

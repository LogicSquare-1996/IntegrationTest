const User = require("../../../../database/mongoose/models/user")
const Todo =require("../../../../database/mongoose/models/todo")
const TodoRepo = require("../../../../database/mongoose/repositories/TodoRepo")
const  UserRepo = require("../../../../database/mongoose/repositories/UserRepo")
const { SuccessResponse } = require("../../../../lib/core/apiResponse")
const { BadRequestError, AuthFailureError } = require("../../../../lib/core/apiError")

module.exports = {
    // createTodo: async (req, res) =>{
    //     const {title, description, priority, status, dueDate} = req.body 
    //     if(!title || !description) throw BadRequestError("All fields are required")
    //     const user = await UserRepo.findById(req.user._id)
        
    //     const todo = await TodoRepo.createTodo(title, description, priority, status, dueDate, user._id)
    //     return SuccessResponse(res, "Todo created successfully", todo)
    // },

    
        createTodo: async (req, res) => {
            const { title, description, priority, status, dueDate } = req.body;
            if (!title || !description) {
                return res.status(400).json({ message: "Title and description are required" });
            }
        
            try {
                const user = await UserRepo.findById(req.user._id);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
        
                const todo = await TodoRepo.createTodo(title, description, priority, status, dueDate, user._id);
                return res.status(200).json({ message: "Todo created successfully", todo });
            } catch (error) {
                return res.status(500).json({ message: "An error occurred", error: error.message });
            }
        },
        

    getTodos: async(req, res)=>{
        try {
            const user = await UserRepo.findById(req.user._id)
            if(!user) return res.status(400).json({message: "User not found"})
            const todos = await TodoRepo.getAllTodos(user._id)
            if(!todos) return res.status(400).json({message: "No todos found"})
            return res.status(200).json({message: "Todos found", todos})
        } catch (error) {
            return res.status(500).json({message: "An error occurred", error: error.message})
        }
    },

    getTodo: async(req, res)=>{
        try {
            const user = await UserRepo.findById(req.user._id)
            if(!user) return res.status(400).json({message: "User not found"})
            const todo = await TodoRepo.getTodoById(req.params.id, user._id)
            if(!todo) return res.status(400).json({message: "Todo not found"})
            return res.status(200).json({message: "Todo found", todo})
        } catch (error) {
            return res.status(500).json({message: "An error occurred", error: error.message})
        }
    }
}

const User = require("../../../../database/mongoose/models/user")
const Todo =require("../../../../database/mongoose/models/todo")
const TodoRepo = require("../../../../database/mongoose/repositories/TodoRepo")
const  UserRepo = require("../../../../database/mongoose/repositories/UserRepo")
const { SuccessResponse } = require("../../../../lib/core/apiResponse")
const { BadRequestError, AuthFailureError } = require("../../../../lib/core/apiError")

module.exports = {
    createTodo: async (req, res) =>{
        const {title, description, priority, status, dueDate} = req.body 
        if(!title || !description) throw BadRequestError("All fields are required")
        const user = await UserRepo.findById(req.user._id)
        
        const todo = await TodoRepo.createTodo(title, description, priority, status, dueDate, user._id)
        return SuccessResponse(res, "Todo created successfully", todo)
    },

    getTodos: async(req, res)=>{

    }
}

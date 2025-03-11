const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const DOCUMENT_NAME = "Todo";
const COLLECTION_NAME = "todos";

const schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    dueDate: {
      type: Schema.Types.Date,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    isDeleted: {
      type: Boolean,
      default: false, // Soft delete flag
    }
  },
  { timestamps: true }
);

schema.set("toJSON", { virtuals: true });
schema.set("toObject", { virtuals: true });

const Todo = model(DOCUMENT_NAME, schema, COLLECTION_NAME);

module.exports = Todo;

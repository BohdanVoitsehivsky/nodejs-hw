import mongoose from "mongoose";

import { TAGS } from "../constants/tags.js";



const noteSchema = new mongoose.Schema (
  {
  title: {
    type: String,
     required: true,
      trim:true},
  content: {
    type: String,

    default: "",
    trim: true},
  tag: {
    type: String,

    default: "Todo",
    enum: TAGS

  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,


  }
},
{
  timestamps: true,
},
);
noteSchema.index({title: "text", content: "text"});
export const Note = mongoose.model("Note", noteSchema);

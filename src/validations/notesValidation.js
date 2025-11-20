
import {Joi, Segments} from "celebrate";
import { TAGS } from "../constants/tags.js";
import { isValidObjectId } from "mongoose";

const objectIdValidator = (value, helpers)=> {
  if(!isValidObjectId(value)) {
    return helpers.message("Invalid NoteId");
  }
  return value;
};
export const getAllNotesSchema =  {
[Segments.QUERY]: Joi.object({
 page: Joi.number().integer().min(1).default(1),
 perPage: Joi.number().integer().min(5).max(20).default(10),
 tag: Joi.string().valid(...TAGS).optional(),
 search: Joi.string().trim().allow("")
})
};

export const noteIdSchema = {
[Segments.PARAMS]: Joi.object({
  noteId: Joi.string().custom(objectIdValidator).required(),
})
};

export const createNoteSchema = {

[Segments.BODY]:
Joi.object({
title: Joi.string().min(1).required(),
content: Joi.string().allow("").optional(),
tag: Joi.string().valid(...TAGS).optional(),
}),
};





export const updateNoteSchema = {
  ...noteIdSchema,
[Segments.BODY]:Joi.object({
title: Joi.string().min(1),
content: Joi.string().allow(""),
tag: Joi.string().valid(...TAGS),
}).min(1),

};

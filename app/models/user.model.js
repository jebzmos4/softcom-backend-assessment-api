/**
 * Created by Morifeoluwa Jebutu
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const config = require('../config/settings');
const questionSchema = require('./question.model');

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: 'Email address is required',
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
      type: String,
      required: true,
      trim: true
    },
    loggedIn: {
      type: Boolean,
      default: false
    },
    questions: [{
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Questions'
      }
    }]
  },
  {
    timestamps: true
  }
);

UserSchema.plugin(mongoosePaginate);

UserSchema.index({
  firstname: 'text',
  lastname: 'text',
  email: 'text',
  'questions.owner': 'text',
  'questions.question': 'text',
  'questions.answer': 'text',
  'questions.answer.text': 'text'
});
const userModel = mongoose.model(config.mongo.collections.user, UserSchema);
module.exports = userModel;

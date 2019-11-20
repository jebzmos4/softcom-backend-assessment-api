/**
 * Created by Morifeoluwa Jebutu
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const config = require('../config/settings');

const { Schema } = mongoose;

const questionSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'Users' },
  question: String,
  answers: [{
    responder: String,
    text: {
      type: String,
      required: true
    },
    Date: {
      type: Date,
      Default: Date.now
    },
    upVotes: Number,
    downVotes: Number
  }],
  Subscribers: [{
    type: String,
  }],
  upVotes: Number,
  downVotes: Number
});

questionSchema.plugin(mongoosePaginate);
questionSchema.index({
  owner: 'text', answers: 'text', question: 'text', 'answers.text': 'text', 'answers.responder': 'text'
});

const questionModel = mongoose.model(config.mongo.collections.question, questionSchema);
module.exports = questionModel;

/**
 * Created by Morifeoluwa on 18/11/2019.
 * objective: building to scale
 */
const sgMail = require('@sendgrid/mail');
const MongoDBHelper = require('../lib/mongoDBHelper');
const UserModel = require('../models/user.model');
const QuestionModel = require('../models/question.model');
const config = require('../config/settings');


sgMail.setApiKey(config.sendGrid.apikey);

class User {
  /**
     *
     * @param {*} logger Logger Object
     */
  constructor(logger, mongoClient) {
    this.logger = logger;
    this.mongo = new MongoDBHelper(mongoClient, UserModel, QuestionModel);
  }

  getUser(data) {
    return this.mongo.getOneUser(data);
  }

  createUser(data) {
    this.logger.info('inserting record into DB');
    return this.mongo.save(data);
  }

  askQuestion(data) {
    return this.mongo.askQuestion(data);
  }

  answerQuestion(data) {
    const param = data;
    param.upVotes = 0;
    param.downVotes = 0;
    return this.mongo.answerQuestion(param);
  }

  voteAnswer(data) {
    const param = data;
    if (param.vote) param.vote = { 'answers.$.upVotes': 1 };
    param.vote = { 'answers.$.downVotes': 1 };
    return this.mongo.voteAnswer(param);
  }

  voteQuestion(data) {
    const param = data;
    if (data.vote) param.vote = { upVotes: 1 };
    else param.vote = { downVotes: 1 };
    return this.mongo.voteQuestion(param);
  }

  getQuestions(param) {
    if (param.email) return this.mongo.getQuestionsByEmail(param);
    return this.mongo.getQuestions(param);
  }

  search(query) {
    return this.mongo.search(query);
  }

  sendNotification(email, data) {
    this.logger.info('sending notification to user');
    const msg = {
      to: email,
      from: 'test@example.com',
      subject: 'Your Question Has Received an Answer',
      text: `Someone posted the answer: ${data}`,
      html: `Someone posted the answer: <strong>${data}</strong>`,
    };
    sgMail.send(msg);
  }
}

module.exports = User;

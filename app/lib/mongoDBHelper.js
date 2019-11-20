/* eslint-disable radix */
/* eslint-disable no-shadow */
/**
 * Created by Morifeoluwa Jebutu
 * objective: building to scale
 */

const config = require('../config/settings');
const _ = require('lodash');

class MongoDBHelper {
  /**
   * The constructor
   *
   * @param mongodbClient - MongoDB client
   * @param mongodbModel - the model you wish to operate on
   */
  constructor(mongodbClient, mongodbModel, questionModel) {
    this.mongoDBClient = mongodbClient;
    this.MongoDBModel = mongodbModel;
    this.QuestionModel = questionModel;
  }


  /**
   * Saves data into the MongoDB instance
   *
   * @param data
   * @returns {Promise}
   */
  save(data) {
    return new Promise((resolve, reject) => {
      const mongodbSaveSchema = this.MongoDBModel(data);
      return mongodbSaveSchema.save((error, result) => {
        if (error != null) {
          return reject(this.handleError(error));
        }
        return resolve(result);
      });
    });
  }

  /**
   * Updates a SINGLE RECORD in the MongoDB instance's DB based on some conditional criteria
   *
   * @param params - the conditional parameters
   * @param data - the data to update
   * @returns {Promise}
   */
  update(params, data) {
    return new Promise((resolve, reject) => this.MongoDBModel.findOneAndUpdate(
      params.conditions,
      { $set: data },
      { new: true },
      (error, response) => {
        if (error) {
          if (config.logging.console) {
            return new Error(`Update Error: ${JSON.stringify(error)}`);
          }
          return reject(this.handleError(error));
        }
        if (error == null && response == null) {
          return reject(new Error("Record Not Found In DB'"));
        }
        return resolve(response);
      }
    ));
  }

  getOneUser(params) {
    return new Promise((resolve, reject) => {
      const query = this.MongoDBModel.findOne(params);
      if (params.fields) {
        query.select(params.fields);
      }

      return query.exec((err, modelData) => {
        if (err) {
          return reject(this.handleError(err));
        }
        return resolve(modelData);
      });
    });
  }

  askQuestion(data) {
    return new Promise((resolve, reject) => this.MongoDBModel.findOne({ email: data.email })
      .then((response) => {
        const questions = new this.QuestionModel({
          owner: response._id,
          question: data.question
        });
        questions.save()
          .then(saved => this.MongoDBModel
            .update({ _id: response._id }, { $push: { questions: { id: saved._id } } })
            .then(question => resolve(question)))
          .catch(error => reject(error));
      })
      .catch(err => reject(err)));
  }

  getQuestions(param) {
    return new Promise((resolve, reject) => {
      this.QuestionModel.find(param)
        .populate('owner', ['email'])
        .exec((error, questions) => {
          if (error) {
            return reject(error);
          }
          return resolve(questions);
        });
    });
  }

  getQuestionsByEmail(param) {
    return new Promise((resolve, reject) => {
      this.MongoDBModel.find(param)
        .populate('questions.id')
        .exec((error, questions) => {
          const data = [];
          questions.forEach((question) => { data.push(question.questions); });
          if (error) {
            return reject(error);
          }
          return resolve(data);
        });
    });
  }

  answerQuestion(data) {
    return new Promise((resolve, reject) => {
      this.QuestionModel.updateOne(
        { _id: data.questionId },
        { $push: { answers: data } },
        (err, response) => {
          if (err) return reject(err);
          return resolve(response);
        }
      );
    });
  }

  voteAnswer(data) {
    console.log(data);
    return new Promise((resolve, reject) => {
      this.QuestionModel.updateOne({ 'answers._id': data.answerId }, { $inc: data.vote }, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    });
  }

  voteQuestion(data) {
    return new Promise((resolve, reject) => {
      this.QuestionModel.update(
        { _id: data.questionId },
        { $inc: data.vote },
        (err, response) => {
          if (err) return reject(err);
          return resolve(response);
        }
      );
    });
  }

  search(query) {
    const models = [this.QuestionModel, this.MongoDBModel];
    return Promise.all(models.map(model => model.find({ $text: { $search: query.text } })));
  }
  /**
   * Used to format the error messages returned from the MongoDB server during CRUD operations
   *
   * @param report
   * @returns {{error: boolean, message: *}}
   */
  handleError(report) {
    return { error: true, msg: report };
  }
}

module.exports = MongoDBHelper;

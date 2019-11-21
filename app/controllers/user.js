/**
 * Created by Morifeoluwa on 18/11/2019.
 * objective: building to scale
 */

/**
 * Module Dependencies
 */

const jwt = require('../lib/jwtHelper');
const _ = require('lodash');
const Response = require('../lib/response_manager');
const httpStatus = require('../constants/http_status');
const utils = require('../lib/utilities');

class User {
/**
     * Constructor
     *
     * @param logger
     * @param service
     */
  constructor(logger, service) {
    this.logger = logger;
    this.service = service;
  }

  login(req, res) {
    this.logger.info('validating user login credentials');
    if (req.body === null || req.body === undefined || _.isEmpty(req.body)) {
      return Response.failure(res, {
        message: 'This endpoint requires a JSON body parameter'
      }, httpStatus.BAD_REQUEST);
    }
    const errors = utils.checkRequestBody(req.body, ['email', 'password']);
    if (errors) {
      return Response.failure(res, {
        message: 'Missing/Empty parameters in the request body',
        response: errors,
      }, httpStatus.BAD_REQUEST);
    }
    return this.service.getUser(req.body)
      .then((getResponse) => {
        if (_.isEmpty(getResponse)) {
          return Response.failure(res, {
            message: 'Login Failed',
            response: 'User does not exist',
          }, httpStatus.FORBIDDEN);
        }
        if (getResponse.password === req.body.password) {
          this.logger.info('login successful');
          const token = jwt.generateToken(req.body);
          return Response.success(res, {
            message: 'Login Successful',
            response: token
          }, httpStatus.ACCEPTED);
        } return Response.failure(res, {
          message: 'Login Failed',
          response: 'Invalid Credentials',
        }, httpStatus.FORBIDDEN);
      }).catch(err => Response.failure(res, {
        message: 'Login Failed',
        response: `invalid email or password ${err}`
      }, httpStatus.FORBIDDEN));
  }


  signUp(req, res) {
    this.logger.info('creating user data in DB');
    if (req.body === null || req.body === undefined || _.isEmpty(req.body)) {
      return Response.failure(res, {
        message: 'This endpoint requires a JSON body parameter'
      }, httpStatus.BAD_REQUEST);
    }
    const errors = utils.checkRequestBody(req.body, ['firstname', 'lastname', 'email']);
    if (errors) {
      this.logger.error('required body parameter not passed');
      return Response.failure(res, {
        message: 'required param not found',
        response: errors
      }, httpStatus.BAD_REQUEST);
    }
    const param = req.body;
    param.loggedIn = true;
    return this.service.createUser(req.body)
      .then((response) => {
        if (response.createdAt) {
          response.password = undefined;
          return Response.success(res, {
            message: 'User Data successfully created in DB',
            response
          }, httpStatus.OK);
        }
        return Response.failure(res, {
          message: 'Error creating user data',
          response
        }, httpStatus.BAD_REQUEST);
      })
      .catch(err => Response.failure(res, {
        message: 'Unable to create User data',
        response: err.msg
      }, httpStatus.BAD_REQUEST));
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  logout(req, res, next) {
    try {
      if (req.body === null || req.body === undefined || _.isEmpty(req.body)) {
        return Response.failure(res, {
          message: 'This endpoint requires a JSON body parameter'
        }, httpStatus.BAD_REQUEST);
      }
      const errors = utils.checkRequestBody(req.body, ['email']);
      if (errors) {
        this.logger.error('required body parameter not passed');
        return Response.failure(res, {
          message: 'required param not found',
          response: errors
        }, httpStatus.BAD_REQUEST);
      }
      const param = req.body;
      param.loggedIn = false;
      return this.service.updateUser(param)
        .then(() => Response.success(res, {
          message: 'success',
          response: {}
        }, httpStatus.OK))
        .catch((error) => {
          Response.failure(res, {
            message: '',
            response: error
          }, httpStatus.INTERNAL_SERVER_ERROR);
        });
    } catch (error) {
      return next(error);
    }
  }

  askQuestion(req, res, next) {
    try {
      this.logger.info('creating user question in DB');
      if (req.body === null || req.body === undefined || _.isEmpty(req.body)) {
        return Response.failure(res, {
          message: 'This endpoint requires a JSON body parameter'
        }, httpStatus.BAD_REQUEST);
      }
      const errors = utils.checkRequestBody(req.body, ['email', 'question']);
      if (errors) {
        this.logger.error('required body parameter not passed');
        return Response.failure(res, {
          message: 'required param not found',
          response: errors
        }, httpStatus.BAD_REQUEST);
      }
      const data = { ...req.body };
      return this.service.askQuestion(data)
        .then((response) => {
          response.password = undefined;
          Response.success(res, {
            message: 'Question Successfully Created',
            response: req.body.question
          }, httpStatus.OK);
        })
        .catch(error => Response.failure(res, {
          message: 'Unable to add question',
          response: error
        }, httpStatus.NOT_IMPLEMENTED));
    } catch (error) {
      return next(error);
    }
  }

  getQuestion(req, res, next) {
    try {
      this.logger.info('Fetching Questions');
      const param = req.query;
      return this.service.getQuestions(param)
        .then((response) => {
          if (_.isEmpty(response)) {
            return Response.success(res, {
              message: 'Questions not found',
              response: null
            }, httpStatus.OK);
          }
          return Response.success(res, {
            message: 'User Question(s) fetched',
            response
          }, httpStatus.OK);
        }).catch(error => Response.failure(res, {
          message: 'Unable to fetch questions',
          response: error
        }, httpStatus.BAD_REQUEST));
    } catch (e) {
      return next(e);
    }
  }

  answerQuestion(req, res, next) {
    try {
      this.logger.info('Answering User Question');
      if (req.body === null || req.body === undefined || _.isEmpty(req.body)) {
        return Response.failure(res, {
          message: 'This endpoint requires a JSON body parameter'
        }, httpStatus.BAD_REQUEST);
      }
      const errors = utils.checkRequestBody(req.body, ['questionId', 'text', 'responder']);
      if (errors) {
        this.logger.error('required body parameter not passed');
        return Response.failure(res, {
          message: 'required param not found',
          response: errors
        }, httpStatus.BAD_REQUEST);
      }
      return this.service.answerQuestion(req.body)
        .then((response) => {
          if (response.nModified === 0) {
            return Response.failure(res, {
              message: 'Question does not exist',
              response: false
            }, httpStatus.NOT_IMPLEMENTED);
          }
          this.service.getQuestions({ _id: req.body.questionId })
            .then((fetchResponse) => {
              this.service.sendNotification(fetchResponse[0].owner.email, req.body.text);
            }).catch(fetchError => Response.failure(res, {
              message: 'Unable to send notification to user',
              response: fetchError
            }));
          return Response.success(res, {
            message: 'Question Answered',
            response: req.body.text
          }, httpStatus.OK);
        }).catch(error => Response.failure(res, {
          message: 'Unable to fetch question',
          response: error
        }, httpStatus.BAD_REQUEST));
    } catch (e) {
      return next(e);
    }
  }

  voteQuestion(req, res, next) {
    try {
      this.logger.info('Voting a question');
      if (req.body === null || req.body === undefined || _.isEmpty(req.body)) {
        return Response.failure(res, {
          message: 'This endpoint requires a JSON body parameter'
        }, httpStatus.BAD_REQUEST);
      }
      const errors = utils.checkRequestBody(req.body, ['questionId', 'vote']);
      if (errors) {
        this.logger.error('required body parameter not passed');
        return Response.failure(res, {
          message: 'required param not found',
          response: errors
        }, httpStatus.BAD_REQUEST);
      }
      return this.service.voteQuestion(req.body).then(() =>
        Response.success(res, {
          message: 'Vote successfully recorded'
        }, httpStatus.OK))
        .catch(error => Response.failure(res, {
          message: 'Unable to record user vote',
          response: error
        }, httpStatus.BAD_REQUEST));
    } catch (e) {
      return next(e);
    }
  }

  voteAnswer(req, res, next) {
    try {
      this.logger.info('Voting a question');
      if (req.body === null || req.body === undefined || _.isEmpty(req.body)) {
        return Response.failure(res, {
          message: 'This endpoint requires a query parameter'
        }, httpStatus.BAD_REQUEST);
      }
      const errors = utils.checkRequestBody(req.body, ['answerId', 'vote']);
      if (errors) {
        this.logger.error('required body parameter not passed');
        return Response.failure(res, {
          message: 'required param not found',
          response: errors
        }, httpStatus.BAD_REQUEST);
      }
      return this.service.voteAnswer(req.body).then(() =>
        Response.success(res, {
          message: 'Vote successfully recorded',
          response: 'Your vote has been recorded'
        }, httpStatus.OK))
        .catch(error => Response.failure(res, {
          message: 'Unable to record user vote',
          response: error
        }, httpStatus.BAD_REQUEST));
    } catch (e) {
      return next(e);
    }
  }

  search(req, res, next) {
    try {
      if (req.query === null || req.query === undefined || _.isEmpty(req.query)) {
        return Response.failure(res, {
          message: 'This endpoint requires a search query parameter'
        }, httpStatus.BAD_REQUEST);
      }
      const errors = utils.checkRequestBody(req.query, ['text']);
      if (errors) {
        this.logger.error('required query parameter not passed');
        return Response.failure(res, {
          message: 'required param not found',
          response: errors
        }, httpStatus.BAD_REQUEST);
      }
      return this.service.search(req.query).then(response => Response.success(res, {
        message: 'Search Completed',
        response
      }, httpStatus.OK)).catch(error => Response.failure(res, {
        message: 'Error while searching for text',
        response: error
      }, httpStatus.BAD_REQUEST));
    } catch (e) {
      return next(e);
    }
  }
}

module.exports = User;

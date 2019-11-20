/**
 * Created by Morifeoluwa on 18/11/2019.
 * objective: building to scale
 */
const swaggerUi = require('swagger-ui-restify');
const swaggerDocument = require('../swagger.json');
const { verifyToken } = require('../lib/jwtHelper');

const routes = function routes(server, serviceLocator) {
  const userHandler = serviceLocator.get('userController');

  const options = {
    explorer: true,
    baseURL: 'api-docs',
  };

  server.get(/\/api-docs\/+.*/, ...swaggerUi.serve);
  server.get('/api-docs', swaggerUi.setup(swaggerDocument, options));

  server.get({
    path: '/',
    name: 'base',
    version: '1.0.0'
  }, (req, res) => res.send('Welcome to the Softcom Backend Assessment API'));

  /**
   * SIGN UP
   */
  server.post({
    path: '/signUp',
    name: 'signs up a user',
  }, (req, res) => userHandler.signUp(req, res));

  /**
   * LOGIN
   */
  server.post({
    path: '/login',
    name: 'authenticates a user',
  }, (req, res, next) => userHandler.login(req, res, next));

  /**
   * LOGOUT
   */
  server.patch({
    path: '/logout',
    name: 'logs a user out',
  }, verifyToken, (req, res, next) => userHandler.logout(req, res, next));

  /**
   * ASK A QUESTION
   */
  server.post({
    path: '/question',
    name: 'Ask Question',
  }, verifyToken, (req, res, next) => userHandler.askQuestion(req, res, next));

  /**
   * VIEW QUESTIONS
   */
  server.get({
    path: '/question',
    name: 'GET Question(s)',
  }, verifyToken, (req, res, next) => userHandler.getQuestion(req, res, next));

  /**
   * ANSWER QUESTION
   */
  server.post({
    path: '/answer',
    name: 'Answer Question',
  }, verifyToken, (req, res, next) => userHandler.answerQuestion(req, res, next));

  /**
   * VOTE ANSWER
   */
  server.post({
    path: '/voteAnswer',
    name: 'VOTE Answer',
  }, verifyToken, (req, res, next) => userHandler.voteAnswer(req, res, next));

  /**
   * VOTE QUESTION
   */
  server.post({
    path: '/voteQuestion',
    name: 'VOTE Question',
  }, verifyToken, (req, res, next) => userHandler.voteQuestion(req, res, next));

  /**
   * SEARCH
   */
  server.get({
    path: '/search',
    name: 'Search',
  }, verifyToken, (req, res, next) => userHandler.search(req, res, next));
};

module.exports = routes;

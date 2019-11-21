// During the test the env variable is set to test
/* global describe, it */
/* eslint no-undef: "error" */
process.env.NODE_ENV = 'development';

// Require the dev-dependencies
const chai = require('chai');
const should = require('should');
const chaiHttp = require('chai-http');
const server = require('../app/index');

let auth;

chai.use(chaiHttp);
// Our parent block


describe('/QUESTIONS', () => {
  before((done) => {
    const credentials = {
      email: 'morife@gokada.ng',
      password: '12345'
    };
    chai.request(server)
      .post('/login')
      .send(credentials)
      .end((err, res) => {
        res.status.should.be.equal(202);
        should(res.body).have.property('message', 'Login Successful');
        should(res.body.response).have.property('token');
        auth = res.body.response.token;
        done();
      });
  });
  it('it should GET all questions', (done) => {
    chai.request(server)
      .get('/question')
      .set('token', auth)
      .end((err, res) => {
        res.status.should.be.equal(200);
        done();
      });
  });

  it('it should not create a question without owner', (done) => {
    chai.request(server)
      .post('/question')
      .set('token', auth)
      .send({
        question: 'What is your name?'
      })
      .end((err, res) => {
        res.status.should.be.equal(400);
        should(res.body).have.property('message', 'required param not found');
        should(res.body.response).be.eql({ email: 'is required' });
        done();
      });
  });

  it('it should not create empty questions', (done) => {
    chai.request(server)
      .post('/question')
      .set('token', auth)
      .send({
        question: '',
        email: 'jj@gmail.com'
      })
      .end((err, res) => {
        res.status.should.be.equal(501);
        should(res.body).have.property('message', 'Unable to add question');
        should(res.body.response).be.eql({});
        done();
      });
  });

  it('it should not create questions for non-existing user', (done) => {
    chai.request(server)
      .post('/question')
      .set('token', auth)
      .send({
        question: 'What is your name?',
        email: 'jj@gmail.com'
      })
      .end((err, res) => {
        res.status.should.be.equal(501);
        should(res.body).have.property('message', 'Unable to add question');
        should(res.body.response).be.eql({});
        done();
      });
  });

  it('User should be able to ask question', (done) => {
    const data = {
      email: 'morife@gokada.ng',
      question: 'whats your name?'
    };
    chai.request(server)
      .post('/question')
      .send(data)
      .set('token', auth)
      .end((err, res) => {
        res.status.should.be.equal(200);
        should(res.body).have.property('message', 'Question Successfully Created');
        done();
      });
  });
});

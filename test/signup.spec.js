// During the test the env variable is set to test
/* global describe, it */
/* eslint no-undef: "error" */
process.env.NODE_ENV = 'development';

// Require the dev-dependencies
const chai = require('chai');
const should = require('should');
const chaiHttp = require('chai-http');
const server = require('../app/index');

chai.use(chaiHttp);
// Our parent block
describe('User SignUp Tests', () => {
  /*
  * Test the /GET route
  */
  describe('/GET base endpoint', () => {
    it('it should GET the default endpoint', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.status.should.be.equal(200);
          done();
        });
    });
  });

  describe('/SIGN UP', () => {
    it('it should not sign up user without email', (done) => {
      chai.request(server)
        .post('/signUp')
        .send({
          firstname: 'Morife',
          lastname: 'Jebz',
          password: '12345'
        })
        .end((err, res) => {
          res.status.should.be.equal(400);
          should(res.body).have.property('message', 'required param not found');
          should(res.body.response).be.eql({ email: 'is required' });
          done();
        });
    });

    it('it should not sign up user without password', (done) => {
      chai.request(server)
        .post('/signUp')
        .send({
          firstname: 'Morife',
          lastname: 'Jebz',
          email: 'jj@gmail.com'
        })
        .end((err, res) => {
          res.status.should.be.equal(400);
          should(res.body).have.property('message', 'required param not found');
          should(res.body.response).be.eql({ password: 'is required' });
          done();
        });
    });

    it('it should successfully Sign up user successfully', (done) => {
      const credentials = {
        lastname: 'jebzmos4',
        firstname: '123456',
        email: 'morifeoluwa@gmail.com',
        password: 123456
      };
      chai.request(server)
        .post('/signUp')
        .send(credentials)
        .end((err, res) => {
          res.status.should.be.equal(200);
          should(res.body).have.property('message', 'User Data successfully created in DB');
          done();
        });
    });
  });
});

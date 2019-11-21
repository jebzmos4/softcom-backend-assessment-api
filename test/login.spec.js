// During the test the env variable is set to test
process.env.NODE_ENV = 'development';

// Require the dev-dependencies
const chai = require('chai');
const should = require('should');
const chaiHttp = require('chai-http');
const server = require('../app/index');

chai.use(chaiHttp);
// Our parent block
describe('User Login Tests', () => {
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

  describe('/LOGIN', () => {
    it('it should not login user without email', (done) => {
      chai.request(server)
        .post('/login')
        .send({
          password: 'Morife'
        })
        .end((err, res) => {
          res.status.should.be.equal(400);
          should(res.body).have.property('message', 'Missing/Empty parameters in the request body');
          should(res.body.response).be.eql({ email: 'is required' });
          done();
        });
    });

    it('it should not login user without password', (done) => {
      chai.request(server)
        .post('/login')
        .send({
          email: 'jj@gmail.com'
        })
        .end((err, res) => {
          res.status.should.be.equal(400);
          should(res.body).have.property('message', 'Missing/Empty parameters in the request body');
          should(res.body.response).be.eql({ password: 'is required' });
          done();
        });
    });

    it('it should successfully Login user', (done) => {
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
          done();
        });
    });
  });
});

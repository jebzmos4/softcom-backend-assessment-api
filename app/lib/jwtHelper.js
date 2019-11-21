const jwt = require('jsonwebtoken');
const utf8 = require('utf8');
const base64 = require('base-64');
const { jwt: { secret, expiresIn } } = require('../config/settings');
const Response = require('./response_manager');
const httpStatus = require('../constants/http_status');


function generateToken(params) {
  const jwtToken = jwt.sign({
    data: params.email
  }, secret, { expiresIn });
  const bytes = utf8.encode(jwtToken);
  const token = base64.encode(bytes);

  return {
    token,
    expiresIn
  };
}

function verifyToken(req, res, next) {
  try {
    const { token } = req.headers;

    if (!token) {
      return Response.failure(res, {
        message: 'Authorization code is empty.',
        response: {},
      }, httpStatus.FORBIDDEN);
    }

    // eslint-disable-next-line no-inner-declarations
    function verifyCallBack(error, decoded) {
      if (error) {
        return Response.failure(res, {
          message: 'Access Unauthorized',
          response: {},
        }, httpStatus.UNAUTHORIZED);
      }
      // eslint-disable-next-line no-sequences
      if (req.method === 'PUT' || req.method === 'DELETE', req.method === 'PATCH' || req.method === 'GET') {
        req.updateBy = decoded.data;
      } else if (req.method === 'POST') {
        req.createdBy = decoded.data;
      }
      return next();
    }

    const bytes = base64.decode(token);
    const Token = utf8.decode(bytes);

    return jwt.verify(Token, secret, verifyCallBack);
  } catch (error) {
    return next(error);
  }
}

module.exports = Object.assign({}, { generateToken, verifyToken });

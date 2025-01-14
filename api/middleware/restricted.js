const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../../index')

module.exports = (req, res, next) => {
  if(!req.headers.authorization) {
    next({status: 401, message: 'token required'})
  }

  jwt.verify(req.headers.authorization, JWT_SECRET, (err, decodedToken) => {
    if(err){
      res.status(401).json({message: "token invalid"});
      return;
    }

    req.jwt = decodedToken;
    next();
  })

  
  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
};

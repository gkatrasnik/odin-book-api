const jsonwebtoken = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.SECRET;

function issueJWT(user) {
  const _id = user._id;

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, secretKey);

  return { token: signedToken };
}

module.exports.issueJWT = issueJWT;

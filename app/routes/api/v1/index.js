const express = require('express');
const router = express.Router();

router.use('/', require('./users'));
router.use('/todolists', require('./todolists'));

router.use((err, req, res, next) => {
  if(err.name === 'ValidationError') {
    return res.status(422).json({ status: 422,
      message: "Invalid data", statusMessage: "error",
      errors: Object.keys(err.errors).reduce((errors, key) => {
        errors[key] = err.errors[key].message;
        return errors;
      }, {})
    });
  } else if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ status: 401,
      message: "Unauthorized", statusMessage: "error",
      errors: { "Token" : "No authorization token was found." }
    });
  }
  return next(err);
});

module.exports = router;

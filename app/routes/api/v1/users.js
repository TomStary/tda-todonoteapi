const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
const User = mongoose.model('User');
const auth = require('../../auth');

router.get('/user', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if(!user) {
      return res.sendStatus(403);
    }

    return res.json({ user: user.toAuthJSON() });
  }).catch(next);
});

router.put('/user', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if(!user) {
      return res.sendStatus(403);
    }

    if(req.body.user && req.body.user.currentPassword) {
      let errorsCount = 0;
      const errorsHash = {};

      if(!user.validPassword(req.body.user.currentPassword)) {
        return res.status(422)
        .json({ errors: { currentPassword: "Current password isn't correct." }});
      }

      if(req.body.user.fullname != null) {
        if(req.body.user.fullname.length > 0) {
          user.fullname = req.body.user.fullname;
        } else {
          errorsHash.fullname = "Can't be blank.";
          errorsCount++;
        }
      }

      if(req.body.user.password != null) {
        if(req.body.user.password.length > 0) {
          user.setPassword(req.body.user.password);
        } else {
          errorsHash.password = "Can't be blank.";
          errorsCount++;
        }
      }

      if(errorsCount > 0) {
        return res.status(422).json({ errors: errorsHash });
      }

      return user.save().then(() => {
        return res.json({ status: "updated", user: user.toAuthJSON() });
      });
    } else {
      return res.status(422)
      .json({ errors: { currentPassword: "Can't be blank." }});
    }
  }).catch(next);
});

router.post('/users/login', (req, res, next) => {
  let errorsCount = 0;
  const errorsHash = {};
  const errorMessage = "Can't be blank.";

  if(!req.body.user) {
    errorsHash.email = errorMessage;
    errorsHash.password = errorMessage;
    errorsCount = 2;
  } else {
    if(!req.body.user.email) {
      errorsHash.email = errorMessage;
      errorsCount++;
    }

    if(!req.body.user.password) {
      errorsHash.password = errorMessage;
      errorsCount++;
    }
  }

  if(errorsCount > 0) {
    return res.status(422).json({ errors: errorsHash });
  }

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if(err) {
      return next(err);
    }

    if(user) {
      user.token = user.generateJWT();
      return res.json({ user: user.toAuthJSON() });
    } else {
      return res.status(422).json(info);
    }

  })(req, res, next);
});

router.post('/users', (req, res, next) => {
  let errorsCount = 0;
  const errorsHash = {};
  const errorMessage = "Can't be blank.";

  if(!req.body.user) {
    errorsHash.fullname = errorMessage;
    errorsHash.email = errorMessage;
    errorsHash.password = errorMessage;
    errorsCount = 3;
  } else {
    if(!req.body.user.fullname) {
      errorsHash.fullname = errorMessage;
      errorsCount++;
    }

    if(!req.body.user.email) {
      errorsHash.email = errorMessage;
      errorsCount++;
    }

    if(!req.body.user.password) {
      errorsHash.password = errorMessage;
      errorsCount++;
    }
  }

  if(errorsCount > 0) {
    return res.status(422).json({ errors: errorsHash });
  }

  const user = new User();
  user.fullname = req.body.user.fullname;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user.save().then(() => {
    return res.json({ user: user.toAuthJSON() });
  }).catch(next);
});

router.delete('/user/:userId', auth.required, (req, res, next) => {
  if(!req.payload.id) {
    return res.sendStatus(403);
  }

  User.findById(req.params.userId).then((user) => {
    if(!user) {
      return res.sendStatus(404);
    }

    if (user._id.toString() === req.payload.id) {
      return res
        .status(422)
        .json({
          status: 422,
          message: 'Unprocessable Entity',
          statusMessage: 'error',
          errors: {
            user: 'Can\'t delete current user.'
          }
        });
    }

    return user
      .deleteOne()
      .then(() => {
        return res.sendStatus(204);
      });
  }).catch(next);

});

module.exports = router;

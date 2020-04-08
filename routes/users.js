const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')

// Bring in models.
let User = require('../models/user')

// Register form route.
router.get('/register', (req, res) => {
  res.render('register')
})

// Register process.
router.post('/register', [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Email is not valid').isEmail(),
    check('username', 'Username is required').notEmpty(),
    check('password', 'Password is required').notEmpty(),
    check('password2', 'Passwords do not match')
      .notEmpty()
      .custom((value, {req}) => value === req.body.password)
  ], (req, res) => {

  // Validation & save entity.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('register', {
      errors: errors.array()
    })
  }
  else {
    const name = req.body.name
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password

    let newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    })

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          console.log(err)
        }
        newUser.password = hash

        newUser.save((err) => {
          if (err) {
            console.log(err)
            return
          } 
          else {
            req.flash('success', 'You are now registered and can log in.')
            res.redirect('/users/login')
          }
        })
      })
    })
  }
})

router.get('/login', (req, res) => {
  res.render('login')
});

module.exports = router

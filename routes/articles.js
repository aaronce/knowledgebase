const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')

// Bring in models.
let Article = require('../models/article')
let User = require('../models/user')

// Add Article Route.
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_article', {
    title: 'Add Article'
  })
})

// Add submit POST Route.
router.post('/add', [
  check('title', 'Title is required').notEmpty(),
  //check('author', 'Author is required').notEmpty(),
  check('body', 'Body is required').notEmpty()
], (req, res) => {
  // Finds validation errors in the request.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('add_article', {
      title: 'Add Article',
      errors: errors.array()
    })
  }
  else {
    let article = new Article()
    article.title = req.body.title
    article.author = req.user._id
    article.body = req.body.body
    
    article.save((err) => {
      if (err) {
        console.log(err)
      }
      else {
        req.flash('success', 'Article added.')
        res.redirect('/')
      }
    })
  }
})

// Load Edit article route.
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      req.flash('danger', 'Not Authorised.')
      res.redirect('/')
    }
    res.render('edit_article', {
      title: 'Edit Article',
      article: article
    })
  })
})

// Add Edit submit POST Route.
router.post('/edit/:id', (req, res) => {
  let article = {}
  article.title = req.body.title
  article.author = req.body.author
  article.body = req.body.body

  let query = {_id:req.params.id}
  
  Article.update(query, article, (err) => {
    if (err) {
      console.log(err)
    }
    else {
      req.flash('success', 'Article updated.')
      res.redirect('/')
    }
  })
})

// Delete article route.
router.delete('/:id', (req, res) => {
  if (!req.user._id) {
    res.status(500).send()
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      res.status(500).send()
    }
    else {
      Article.deleteOne(query, (err) => {
        if (err) {
          console.log(err)
        }
    
        res.send('Success')
      })
    }
  })
})

// Get single article.
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render('article', {
        article: article,
        author: user.name
      })
    })
  })
})

// Access control.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  else {
    req.flash('danger', 'Please login.')
    res.redirect('/users/login')
  }
}

module.exports = router
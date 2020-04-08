const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')

// Bring in models.
let Article = require('../models/article')

// Add Article Route.
router.get('/add', (req, res) => {
  console.log('testo')
  res.render('add_article', {
    title: 'Add Article'
  })
})

// Add submit POST Route.
router.post('/add', [
  check('title', 'Title is required').notEmpty(),
  check('author', 'Author is required').notEmpty(),
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
    article.author = req.body.author
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
router.get('/edit/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
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
  let query = {_id:req.params.id}

  Article.remove(query, (err) => {
    if (err) {
      console.log(err)
    }

    res.send('Success')
  })
})

// Get single article.
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render('article', {
      article: article
    })
  })
})

module.exports = router
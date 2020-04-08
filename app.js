console.log('APP STARTED...')

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')

mongoose.connect('mongodb://localhost/nodekb')
let db = mongoose.connection

// check for DB errors.
db.on('open', () => {
  console.log('Connected to mongodb')
})

// check for DB errors.
db.on('error', (err) => {
  console.log(err)
})

const app = express()

// Body Parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Set public folder.
app.use(express.static(path.join(__dirname, 'public')))

// Express session middleware. 
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}))

// Express messages middleware.
app.use(require('connect-flash')());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Bring in models.
let Article = require('./models/article')

// Load view engine.
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Home route. 
app.get('/', (req, res) => {
  Article.find({}, (err, articles) => {

    if (err) {
      console.log(err)
    }
    else {
      res.render('index', {
        title: 'Articles',
        articles: articles
      })
    }
  })
})

// Route files.
let articles = require('./routes/articles')
app.use('/articles', articles)

let users = require('./routes/users')
app.use('/users', users)

// Start Server.
app.listen(3000, () => {
  console.log('Server started on port 3000 ....')
})

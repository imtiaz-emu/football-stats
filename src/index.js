const express = require('express')
const path = require('path')
var exphbs = require('express-handlebars')
var bodyParser = require('body-parser')
const session = require('express-session');
const flash = require('connect-flash');

const app = express()

app.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

const matchesRouter = require('./routers/match')
require('./db/mongoose')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const port = process.env.PORT || 8000
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(matchesRouter)

const publicDirPath = path.join(__dirname, '../assets')
const partialDirPath = path.join(__dirname, '../views/partials')
const layoutDirPath = path.join(__dirname, '../views/layouts')
app.use(express.static(publicDirPath))

app.engine('.hbs', exphbs({
  extname: '.hbs',
  defaultLayout: 'application',
  layoutsDir: layoutDirPath,
  partialsDir: partialDirPath,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
}))
app.set('view engine', '.hbs');

app.get('*', (req, res) => {
  res.render('404', {
    title: '404 Not Found'
  })
})

app.listen(port, () => {
  console.log(`Server is listening to Port: ${port}`);
})

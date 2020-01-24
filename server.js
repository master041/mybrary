if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const authorRouter = require('./routes/authors')
const indexRouter = require('./routes/index')
const bookRouter = require('./routes/books')
const bodyParser = require('body-parser')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))
mongoose.connect(process.env.DATABASE_URL, {useUnifiedTopology: true, useNewUrlParser: true})
const db = mongoose.connection;
db.on('error', err => console.log(err))

db.on('open', () => console.log("Connected"))

app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)
app.listen(process.env.PORT || 3000)
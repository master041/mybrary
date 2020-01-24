const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const path = require('path')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
/* const upload = multer({
    dest: uploadPath,
}) */

router.get('/', async (req, res) =>{
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    try{
        const books = await query.exec();
        res.render('books/index',{
            books: books,
            searchOptions: req.query
        })
    }
    catch{
        res.redirect('/')
    }
    
})


router.get('/new', async (req, res) =>{
   await renderNewPage(res, new Book())
})


router.post('/', async (req, res) =>{
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    })
    await saveCover(book, req.body.cover)
    try{
        const newBook = await book.save()
        res.redirect('books')
    }
    catch (ex){
        console.log(ex)
        await renderNewPage(res, book, true)
    }
})

async function renderNewPage(res, book, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new',params)
    }
    catch{
        res.redirect('/books')
    }
}


async function saveCover(book, coverEncoded){
    if(coverEncoded == null) {console.log("nulllleeee");
     return;}
    const cover = JSON.parse(coverEncoded)
    if(cover != null){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}
module.exports = router
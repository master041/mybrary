const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const path = require('path')
const uploadPath = path.join('public', Book.coverImageBasePath)
const multer = require('multer')
const fs = require('fs')
const imageMimeTypes = ['images/jpeg', 'images/png', 'images/gif']
const upload = multer({
    dest: uploadPath,
})

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


router.post('/', upload.single('cover'), async (req, res) =>{
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
        coverImageName: fileName
    })
    try{
        const newBook = await book.save()
        res.redirect('books')
    }
    catch (ex){
        if(book.coverImageName != null){
        removeBookCover(book.coverImageName)
        }
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

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err =>{
        if(err){
            console.error(err);
        }
    })
}
module.exports = router
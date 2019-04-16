const express = require('express');
const app = express();
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

//APP CONFIG
//create database
mongoose.connect('mongodb://localhost:27017/restful_blog_app', { useNewUrlParser: true });
//set up view engine to be ejs
app.set('view engine', 'ejs');
//set up so can serve our custom style sheet
app.use(express.static('public'));
//set up so can use body parser
app.use(bodyParser.urlencoded({extended: true}));
//use method override
app.use(methodOverride('_method'));
//use sanitizer. this must be put after body parser
app.use(expressSanitizer());

//MONGOOSE CONFIG
//create mongoose schema
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

//create mongoose model
const Blog = mongoose.model('Blog', blogSchema);

//RESTFUL ROUTES

//root route
app.get('/', function(req, res){
    res.redirect('/blogs');
});

//Index route
app.get('/blogs', function(req, res){
    //retrieve all blogs from database
   Blog.find({}, function(err, blogs){
       if(err) {
           console.log('ERROR!');
       } else {
           res.render('index', {blogs: blogs});
       }
   });
});

//NEW ROUTE
app.get('/blogs/new', function(req, res){
   res.render('new'); 
});

//CREATE ROUTE
app.post('/blogs', function(req, res){
   //sanitize input, then create blog
   req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.create(req.body.blog, function(err, newBlog){
       if(err){
           res.render('new');
       } else {
        //then, redirect to the index
           res.redirect('/blogs');
       }
   });
});

//SHOW ROUTE
app.get('/blogs/:id', function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect('/blogs');
       } else {
           res.render('show', {blog: foundBlog});
       }
   });
});

//EDIT ROUTE
app.get('/blogs/:id/edit', function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.render('edit', {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put('/blogs/:id', function(req, res){
    //sanitize input
   req.body.blog.body = req.sanitize(req.body.blog.body);
    //take id, find existing blog, and update with new data
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
       if(err) {
           res.redirect('/blogs');
       } else {
           res.redirect('/blogs/' + req.params.id);
       }
   })
});

//DESTROY ROUTE
app.delete('/blogs/:id', function(req, res){
    //destroy blog and redirect
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs');
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log('SERVER IS RUNNING!');
});
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const myDB = require('./DB');

const passport = require('passport');
const initialize = require('./passport-config');
initialize(passport, 
    async email => {
        return await myDB.FindUser(email);
    },
    async id => {
        return await myDB.FindUserId(id);
    }); 

const port = 5000;


app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(express.urlencoded({
    extended:false
}));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.session())
app.use(methodOverride('_method'))


//  ---  Routing  ---

//  Root
app.get('/', GetDB, GetLikes, async (req,res) => {
    
    if (req.isAuthenticated()) {
        const userLike = await myDB.GetLikeUser(req.user.id)
        res.render('./index', {posts: res.posts, likes: res.likes, user: req.user, userLike: userLike, auth: true})
        
    } else {
        res.render('./index', {posts: res.posts, likes: res.likes, user: {username: 'Guest'}, auth: false})
    }
    
    //console.log(posts);
});

// Like
app.post('/like', GetDB, async (req, res) => {
    const likesU = await myDB.GetLikeUser(req.user.id);
    //console.log(likesU)
    if (likesU[0] != undefined) {
        const fin = likesU.some( p => p.postId == req.query.id);
        if (!fin) {
            console.log('liked post', req.query.id, fin);
            myDB.NewLike(req.user.id, req.query.id);
        } else {
            console.log(fin);
        }
    }else {
        console.log('liked post: null style!', req.query.id)
        myDB.NewLike(req.user.id, req.query.id);
    }
    res.redirect('/');
})

//  New Post req 
app.post('/new', async (req, res) => {
    const user = await myDB.FindUser(req.user.email);
    //console.log("NEW POST: ",req.body.title1, user.id, req.body.textarea1);
    await myDB.NewPost(req.body.title1, user.id, req.body.textarea1)
    const postL = await myDB.GetLatestPost();
    await myDB.NewLike(user.id, postL.id);
    res.redirect('/');
});

//  New Post
app.get('/new', CheckNoAuth, (req, res) => {
    res.render('./new', {user: req.user});
});

//  Login
app.get('/login', CheckAuth,(req, res) => {
    res.render('./login')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

//  Register
app.get('/register', CheckAuth,(req, res) => {
    res.render('./register')
})

app.post('/register', async (req, res) => {
    try {
        const hp = await bcrypt.hash(req.body.password1, 8);
        const un = req.body.name1;
        const em = req.body.email1;
        //console.log(un,em,hp);
        
        await myDB.NewUser(un,em,hp).then(() => {
            res.redirect('/login');
        })
        
    } catch (error) {
        throw error
    }
})

// Logout
app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/')
})

//  Debug
app.get('/debug' /*, GetDB*/, (req, res) => {
    //console.log(res.posts);
    res.send('Debug');
})

/// ---  Middleware  ---

function CheckAuth(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    
    next();
}
function CheckNoAuth(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }

    res.redirect('/');
}

async function GetDB(req, res, next) {
    res.posts = await myDB.DB();
    return next();
}

async function GetLikes(req, res, next) {
    res.likes = await myDB.GetLikedPosts();
    //console.log(res.likes);
    return next();
}


// App Start
app.listen(port, () => {
    console.log('Running')
});

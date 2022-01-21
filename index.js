if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    connectionLimit: 5
});
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const passport = require('passport');
const initialize = require('./passport-config');
initialize(passport, 
    async email => {
        return await FindUser(email);
    },
    async id => {
        return await FindUserId(id);
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

//  ---  DB  ---

let posts; // title: 25 username: 15 text: 250 email: 45 


async function DB() {
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query("SELECT * FROM feed ORDER BY id DESC");
        posts = rows;
        conn.release();
        //console.log(posts[0].username);
    } catch (err) {
        throw err;
    }
} 

async function FindUser(email) {
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query(`SELECT * FROM users WHERE email = '${email}'`);
        //console.log(rows[0].email);
        conn.release();
        return rows[0];
    } catch (err) {
        throw err;
    }
} 

async function FindUserId(id) {
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query(`SELECT * FROM users WHERE id = '${id}'`);
        //console.log(rows[0].id);
        conn.release();
        return rows[0];
    } catch (err) {
        throw err;
    }
} 

async function NewPost(title, username, text) {
    try {
        let conn = await pool.getConnection();
        await conn.query(`INSERT INTO feed (title, username, text) VALUES ('${title}','${username}','${text}')`);
        conn.release();
    } catch (err) {
        throw err;
    }
}


async function NewUser(username, email, password) {
    try {
        let conn = await pool.getConnection();
        await conn.query(`INSERT INTO users (username, email, password) VALUES ('${username}','${email}','${password}')`);
        conn.release();
    } catch (err) {
        throw err;
    }
}

//  ---  Routing  ---

//  Root
app.get('/', (req,res) => {
    DB().then(() => {
        if (req.isAuthenticated()) {
            //console.log(req.user)
            res.render('./index', {posts: posts, user: req.user, auth: true})
            
        } else {
            res.render('./index', {posts: posts, user: {username: 'Guest'}, auth: false})
        }
    });
    //console.log(posts);
});

//  New Post req 
app.post('/new', (req, res) => {
    console.log("NEW POST: ",req.body.title1, req.user.username, req.body.textarea1);
    NewPost(req.body.title1, req.user.username, req.body.textarea1).then(() => {
        res.redirect('/');   
    });
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
        
        await NewUser(un,em,hp).then(() => {
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

/// ---  Misc  ---

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

// App Start
app.listen(port, () => {
    console.log('Running')
});

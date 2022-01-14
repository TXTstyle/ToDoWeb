const express = require('express');
const app = express();
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'oskar',
    password: 'Epicgamer1',
    database: 'ForumDB',
    connectionLimit: 5
});

const hostname = 'localhost';
const port = 5000;

app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(express.urlencoded({
    extended:false
}));


let posts; // 25 15 250

async function DB() {
    try {
        let conn = await pool.getConnection();
        let rows = await conn.query("SELECT * FROM feed ORDER BY id DESC");
        posts = rows;
        //console.log(posts[0].username);
    } catch (err) {
        throw err;
    }
} 

async function NewPost(title, username, text) {
    try {
        let conn = await pool.getConnection();
        let rows = await conn.query(`INSERT INTO feed (title, username, text) VALUES ('${title}','${username}','${text}')`);
    } catch (err) {
        throw err;
    }
}

app.post('/new', (req, res) => {
    let ti = String(req.body.title1)
    let na = String(req.body.name1)
    let te = String(req.body.textarea1)
    console.log("NEW POST: ",ti, na, te);
    NewPost(ti,na,te).then(function() {
        res.redirect('/');
        
    });
});


app.get('/', (req,res) => {
    DB().then(function() {
        res.render('./index', {posts: posts})
    });
    //console.log(posts);
});
app.get('/new', (req, res) => {
    res.render('./new');
});

app.listen(port, () => {
    console.log('Running')
});

const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    connectionLimit: 5
});


// title: 25 username: 15 text: 250 email: 45 
// Liked post count:  select f.id, count(l.postId) from feed f inner join likedPosts l on l.postId = f.id where f.id=5 group by f.id order by f.id;


async function DB() {
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query("select f.title, f.text, u.username, f.id, f.userId from feed f inner join users u on u.id = f.userId order by f.id desc");
        conn.release();
        return rows;
        //console.log(posts[0].username);
    } catch (err) {
        throw err;
    }
} 

async function GetLatestPost() {
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query(`SELECT * FROM feed order by id desc`);
        //console.log(rows[0].email);
        conn.release();
        return rows[0];
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

async function GetLikesByUser(userId) {
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query(`select f.id, count(l.postId) likes from feed f inner join likedPosts l on l.postId = f.id where f.userId=${userId} group by f.id order by f.id`);
        //console.log(rows);
        conn.release();
        return rows;
    } catch (err) {
        throw err;
    }
}

async function GetLikeUser(userId) {
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query(`select * from likedPosts where userId=${userId}`);
        //console.log(rows);
        conn.release();
        return rows;
    } catch (err) {
        throw err;
    }
}

async function GetLikedPosts() {
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query(`select f.id, count(l.postId) likes, f.userId userId from feed f inner join likedPosts l on l.postId = f.id group by f.id order by f.id`);
        //console.log(rows);
        conn.release();
        return rows;
    } catch (err) {
        throw err;
    }
}

async function NewLike(userId, postId) {
    try {
        let conn = await pool.getConnection();
        await conn.query(`INSERT INTO likedPosts (userId, postId) VALUES (${userId},${postId})`);
        conn.release();
    } catch (err) {
        throw err;
    }
}

async function NewPost(title, username, text) {
    try {
        let conn = await pool.getConnection();
        await conn.query(`INSERT INTO feed (title, userId, text) VALUES ('${title}','${username}','${text}')`);
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

module.exports = {DB, FindUser, FindUserId, GetLikesByUser, GetLikedPosts, GetLatestPost, GetLikeUser, NewLike, NewPost, NewUser};
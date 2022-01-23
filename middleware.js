const myDB = require('./DB');

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

async function GetUser(req, res, next) {
    res.posts = await myDB.GetUserByName(req.params.user);
    //console.log(res.posts);
    return next();
}

module.exports = {CheckAuth, CheckNoAuth, GetDB, GetLikes, GetUser};
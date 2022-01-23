const express = require('express');
const router = express.Router();
const myDB = require('../DB');
const mw = require('../middleware');


router.get('/', (req, res) => {
    res.redirect('/');
})

router.get('/:user', mw.GetUser, mw.GetLikes, async (req, res) => {
    
    const users = await myDB.GetUsernames();
    
    const findU = users.filter( u => u.username == req.params.user);
    if (res.posts.length <= 0) {
        res.posts = [{title: 'This user has no posts', text: '', username: '', id: 1, userId: null, N: {posts: 0, likes: 0}}];
        res.likes = [{id: null, likes: null, userId: null}];
    }
    //console.log(res.posts, res.likes);
    if (findU.length > 0) {
        const postN = await myDB.GetPostN(findU[0].id)
        const LikedN = await myDB.GetLikedN(findU[0].id)
        const N = {
            posts: postN.c,
            likes: LikedN.c
        }
        //console.log(postN.c);
        res.render('../views/user', {posts: res.posts, likes: res.likes, user: findU[0], userLike: null, N: N, auth: false})   
    }else {
        res.render('./error', {error: 'User not found.'})
    }
})

router.post('/s', (req, res) => {
    const user = req.body.searchName; 
    res.redirect(`/user/${user}`);
})


module.exports = router;
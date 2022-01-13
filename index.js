const express = require('express');
const app = express();

const hostname = '127.0.0.1';
const port = 3000;


app.set('view engine', 'ejs')

app.get('/', (req,res) => {
    res.render('./index')
});

app.listen(port, () => {
    console.log('Running on http://localhost:3000/')
});
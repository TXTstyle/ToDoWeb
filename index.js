const express = require('express');
const app = express();

const hostname = 'localhost';
const port = 5000;


app.set('view engine', 'ejs')
app.use(express.static('public'));

app.get('/', (req,res) => {
    res.render('./index')
});

app.listen(port, () => {
    console.log('Running')
});
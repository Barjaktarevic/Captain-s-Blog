const express = require('express')
const app = express()
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/captains-blog')
    .then(console.log('Successfully connected to the database.'))
    .catch(err => console.log(err));

app.set('views', 'views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

app.listen(3000, () => {
    console.log('Listening on port 3000!')
})

app.get('/', (req, res) => {
    res.render('titlepage')
})

app.get('/home', async (req, res) => {
    res.render('home')
})


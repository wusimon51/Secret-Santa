const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/santa', (req, res) => {
    res.render('index');
});

app.get('/santa/:id', (req, res) => {
    const { id } = req.params;
    res.render('show');
});

app.post('/santa/:id', (req, res) => {
    const { id } = req.params;
    const { question } = req.body;
    res.redirect(`/santa`);
});

app.patch('/santa/:id', (req, res) => {
    const { id } = req.params;
    res.redirect(`/santa`);
});

app.get('/santa/:id/question', (req, res) => {
    const { id } = req.params;
    res.render('question');
});

app.get('/signup', (req, res) => {

})

app.listen(3000, () => {
    console.log('on port 3000')
});
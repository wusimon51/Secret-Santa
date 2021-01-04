const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');

app.use(express.urlencoded({extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/santa', (req, res) => {
    res.render('index', { santas });
});

app.get('/santa/:id', (req, res) => {
    const { id } = req.params;
    const santa = santas.find(s => s.id === parseInt(id));
    res.render('show', { santa });
});

app.post('/santa/:id', (req, res) => {
    const { id } = req.params;
    const santa = santas.find(s => s.id === parseInt(id));
    const { question } = req.body;
    santa.questions.push(question);
    res.redirect(`/santa/${santa.id}`);
});

app.patch('/santa/:id', (req, res) => {
    const { id } = req.params;
    const santa = santas.find(s => s.id === parseInt(id));
    santa.wishlist.push(req.body.item);
    res.redirect(`/santa/${santa.id}`);
});

app.get('/santa/:id/question', (req, res) => {
    const { id } = req.params;
    const santa = santas.find(s => s.id === parseInt(id));
    res.render('question', { santa });
});

app.listen(3000, () => {
    console.log('on port 3000')
});
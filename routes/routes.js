const express = require('express');
const path = require('path');
const methodOverride = require('method-override');

let controller = require('../controller/controller');

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(methodOverride('_method'));

router.get('/santa/:id', controller.getUser, (req, res) => {
    if (req.rows) {
        console.log(req.rows);
    }
});

module.exports = router;
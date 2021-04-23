const express = require('express');
const router = express.Router();

const { protect } = require('./../controllers/authcontroller');


router.get('/dashboard', protect, (req,res) =>{
    
    res.render('dashboard');
    
});


module.exports = router;
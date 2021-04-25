require("dotenv").config();

const { pool } = require("../database/pg");

exports.picUpload = async (req,res) => {
    
    if(req.user.upload == false){
        return res.render("wrongType")
    }
    const user = await pool.query("UPDATE admins SET pic = '" + req.user.picName + "' WHERE email = '" + req.user.email + "' ");

    if(user){
        res.redirect("/dashboard");
    }else{
        return res.render('uploadFail');
    }
    
}



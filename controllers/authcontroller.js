const { promisify } = require('util');
require("dotenv").config();

const shortid = require("shortid");

const { pool } = require("../database/pg");

const ENV = 'development';
const {
    statusCode,
    returnErrorJsonResponse,
    returnJsonResponse,
  } = require("../Helpers/status.js");

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signToken = (email, first_name, last_name, pic) =>{
    return jwt.sign({email, first_name, last_name, pic}, process.env.SECRET_KEY, {
        expiresIn: "90d"
    });
}

const createSendToken = (user, res) =>{
  const token = signToken(user.rows[0].email, user.rows[0].first_name, user.rows[0].last_name, user.rows[0].pic);


  const cookieOptions = {
    expires: new Date(Date.now() + 90*24*60*60*1000 ),
    httpOnly: true
  }

  if(ENV === 'production') cookieOptions.secure = true;
  return res.cookie('jwt', token, cookieOptions);
  
  //res.redirect('/dashboard');
  
}


exports.registration = async(req,res) => {

    const { email, first_name, last_name, gender, password, confirmpassword } = req.body;

    try {
        if (password !== confirmpassword){
          
          return res.render("passwordNotMatch");
        }
        console.log("here");
        const isUserExist = await pool.query("SELECT email from admins WHERE email = '" + email + "'" );
        console.log("hhhh")
        if (isUserExist.rows.length !== 0) {
          
            return res
              .status(statusCode.error)
              .render('userExist');
          }

        const salt = await bcrypt.genSalt(13);
        const hashPassword = await bcrypt.hash(password, salt);  
        const id = shortid.generate();
        var pic;
        if(gender == "Male"){
          pic = "user-male.jpg";
        }else{
          pic = "user-female.jpg";
        }

        const createAdminQuery =
        "INSERT INTO admins (id, first_name, last_name, gender, password, email, pic) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";

        const createNewUser = await pool.query(createAdminQuery, [
            id,
            first_name,
            last_name,
            gender,
            hashPassword,
            email, 
            pic,
          ]);

        //const newUser = createNewUser[0];

        //const token = signToken(newUser.email, newUser.first_name, newUser.last_name, newUser.pic);
        if(createNewUser){
            // res.set( {
            //     'token': token
            // });
            // console.log(token);
            res.redirect('/login') 
        }else{
            return res
            .status(statusCode.bad)
            .json(
              returnErrorJsonResponse(
                statusCode.bad,
                "fail",
                "Something went wrong, couldnt save user. Check internet connection",
                error
              )
            );            
        }
        


    } catch (error) {
        return res
        .status(statusCode.bad)
        .json(
          returnErrorJsonResponse(
            statusCode.bad,
            "fail",
            "Something went wrong, Please try again 1",
            error
          )
        );        
    }
}


exports.login = async (req,res) => {
    try {
        const {email, password} = req.body;

        const user = await pool.query(
          "Select * from admins WHERE email = '" +
           email + "' "
      );

        if(user.rows[0] === undefined || !(await bcrypt.compare(password, user.rows[0].password))){
            return res.render("404login")           
        }

        ///send token
        createSendToken(user, res);


        // const token = signToken(user[0].email, user[0].role);
        // console.log(token);

        return res.redirect('/dashboard');
        // return res
        // .status(statusCode.success)
        // .json(
        //     returnJsonResponse(
        //     statusCode.success,
        //     "success",
        //     "Logged in",
        //     token
        //   )
        // );
    } catch (error) {
        return res.render("404login")        
    }
}


exports.protect = async (req,res,next) => {
  try{
    let token;

    if(req.cookies.jwt){
      token = req.cookies.jwt;
    }

    if(token === "loggedout"){
      return res.render("pleaselogin");
    }
    if(!token){
      return res
      .status(statusCode.unauthorized)
      .json(
        returnErrorJsonResponse(
          statusCode.unauthorized,
          "fail",
          "Not logged in",
          error
        )
      );
    }

    //verify
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);

    ///check if user exits
    const freshUser = await pool.query(
      "Select * from admins WHERE email = '" +
      decoded.email + "' "
  );

    if(!freshUser){
      return res
      .status(statusCode.unauthorized)
      .json(
        returnErrorJsonResponse(
          statusCode.unauthorized,
          "fail",
          "User Doesnt exist anymore",
          error
        )
      );      
    }

    ////Grant Access
    req.user = freshUser.rows[0];
    next();
  }catch{
    return res
    .status(statusCode.bad)
    .json(
      returnErrorJsonResponse(
        statusCode.bad,
        "fail",
        "Something went wrong, Please try again",
        error
      )
    );
  }
}

exports.restrictTo = (...roles) =>{
  return (req,res,next) =>{
    if(!roles.includes(req.user.role)) {
      return res.render("notallowed");      
    }
    next();
  };
};

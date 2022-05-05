const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();
const { validationResult } = require('express-validator');
const uuid = require('uuid')
const nodemailer = require('nodemailer')


//@route    POST auth/login
//@desc     Authenticate user & get token
//@access   Public

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    //Check if the user exists
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    //JWT Creation

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    const JWT = jwt.sign({ user: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRESIN,
    });
    res.json({msg:'User logged in successfully',data:JWT});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

//@route    POST auth
//@desc     Register user route
//@access   Public

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email,role} = req.body;
  const password = uuid.v4();
  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User Already exists' }] });
    }

    user = new User({
      name,
      email,
      password,
      department
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const JWT = jwt.sign({ user: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRESIN,
    });


    // nodemailer

    let gmailPass = process.env.gmailPass

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'jogeshgupta963@gmail.com',
                pass: gmailPass
            }
        });
        let info = transporter.sendMail({
            from: '"Welcome👻" <jogeshgupta963@gmail.com>',
            to: user.email,
            subject: `Welcome ${user.name} .`,
            html: `<b>You have been registered.Welcome to the ACM. Your password is ${password} </b>`,
        });



    res.json({msg:'User registered successfully',data:JWT});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

//@route    GET user
//@desc     get all user 
//@access   private/admin

exports.getAllUser = async(req,res) =>{

  try{
    const user = await User.find();
    res.status(200).json(user);
  }
  catch(err){
    res.status(400).json(err.message)
  }
}

//@route    PUT user
//@desc     update user password 
//@access   private 

exports.updatePassword = async(req,res)=>{
  try{
      const {currentPassword , newPassword } = req.body;
      const {_id}  = req.user;
      var user = await User.findById(_id).select('password')

      const isMatch = await bcrypt.compare( currentPassword,user.password);
      
      
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Passwords dont match' }] });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.save();
      res.json({user})

  }
  catch(err){
    res.status(400).json(err.message)
  }
}


//@route    GET user/:id
//@desc     to get  user  
//@access   Public

exports.getUser = async(req,res)=>{
  try{
    const {id} = req.params;
    const user = await User.findById(id);
    if(!user) return res.status(400).json("user not found");

    res.status(200).json(user);
  }
  catch(err){
    res.status.json(err.message)
  }
}
//@route    Delete user/:id
//@desc     to delete a  user  
//@access   private
exports.deleteUser = async(req,res)=>{
  try{
    let {id} = req.params;
    const user = await User.findByIdAndDelete(id);
    
    res.status(200).json("user deleted ");
  }
  catch(err){
    res.status(500).json(err.message)
  }
}

//@route    PUT user/:id
//@desc     to update a user  
//@access   Private

exports.updateUser = async(req,res){
  try{
    const {id} = req.params;
    let user = await User.findById(id);

    if(!user) return res.status(400).json("user not found");

    let reqKeys = Object.keys(req.body);

    reqKeys.map(key=>{
      user[key] = req.body[key];
    })

    await user.save();
    res.status.json("updated")

  }
  catch(err){
    res.status(500).json(err.message)
  }
}
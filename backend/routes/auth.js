const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var JWT_SECRET = 'Harryisagoodb$oy';
var fetchuser = require ("../middleware/fetchuser");

//Route 1:Create  a User using: POST "/api/auth/createuser". no login required.

router.post('/createuser',[

    body('name','Enter a valid name').isLength({min:3}),
    body('email','Enter a valid email').isEmail(),
    body('password','passwords must be atleast 5 characters long').isLength({min:5}),



], async(req,res)=>{
 
    // If there are errors , return Bad request and the errors
   const errors =  validationResult(req);
   if(!errors.isEmpty()){
  return res.status(400).json({errors:errors.array()});

   }

    //check whether the user with this email exists already exists.
    try{
let user = await User.findOne({email:req.body.email});
if(user) {

return res.status(400).json({error:"Sorry a user with this email already exists"})

}

    const salt =await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password,salt);


        //create a new user
 user = await User.create({

        name: req.body.name,
        email:req.body.email,
        password: secPass,


   });

   const data = {
    user: {
        id: user.id
    }
}
    const authtoken= jwt.sign(data,JWT_SECRET);
    

   res.json({ authtoken })

} catch (error){
console.error(error.message);
 res.status(500).send("Some Error occured");
}
})
//Rote 2 :Authenticate a User using: POST "/api/auth/login". no login required.

router.post('/login',[

   
    body('email','Enter a valid email').isEmail(),
    body('password','Passwords can not be blank').exists(),
], async(req,res)=>{
 
    // If there are errors , return Bad request and the errors
   const errors =  validationResult(req);
   if(!errors.isEmpty()){
  return res.status(400).json({errors:errors.array()});
}
const { email, password } = req.body;
try {
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if( !passwordCompare) {
    return res.status(400).json({ error: "Invalid credentials"});
  }

  const data = {
    user: {
      id: user.id
    }
  }
  const authtoken = jwt.sign(data, JWT_SECRET);
  res.json({ authtoken })

} catch (error) {
  console.error(error.message);
  res.status(500).send("Internal Server Error");
}

});
//Route 3: Get loggdein User Details using: POST "/api/auth/getuser". login required.

router.post('/getuser', fetchuser, async(req,res)=>{
try{
  userId=req.user.id;
  const user = await User.findById(userId).select("-password")
  res.send(user)
}catch (error) {
  console.error(error.message);
  res.status(500).send("Internal Server Error");
}

})


module.exports = router
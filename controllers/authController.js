
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const{User} = require('../models/user');
require('dotenv').config();

const generateToken = (user) => {

  return jwt.sign({ refId: user.refId}, process.env.SECRETKEY, { expiresIn: '1d' });
};


const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;
      console.log("email&& Pass",email,password);
    try {

      if(email === "admin@gmail.com" && password === "admin@123" ){
      const existingUser = await User.findOne({ where: {email} });
    console.log("admin added successfully");
      if (!existingUser) {
       
        const newUser = await User.create({ refId :"TRS1", name:"Admin", email, password, role:"Admin"});

        const token = generateToken(newUser);

    return res.json({
        token,
        refId: newUser.refId,
        managerRefId: newUser.managerRefId,
        role: newUser.role,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        department: newUser.department,
        teamLeadName: newUser.teamLeadName,
        teamLeadEmail: newUser.teamLeadEmail,
        image_data: newUser.image_data,  
        
      });} }

      const user = await User.findOne({ where: { email } });
        console.log("user:::::",user);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email' });
      }
     console.log(user.password);
     console.log(password);
      const isPasswordValid = await bcrypt.compare(password, user.password);
       
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      const token = generateToken(user);

      res.json({
        token,
        refId: user.refId,
        managerRefId: user.managerRefId,
        role: user.role,
        name: user.name,
        email: user.email,
        password: user.password,
        department: user.department,
        teamLeadName: user.teamLeadName,
        teamLeadEmail: user.teamLeadEmail,
        image_data: user.image_data,  
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = authController;

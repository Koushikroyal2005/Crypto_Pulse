const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendOTP = require('../utils/sendOTP');
const dotenv = require("dotenv").config();

exports.signUp=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(email.length===0 || password.length===0) return res.status(400).json({ msg: "email or password was required" });
        const existuser=await User.findOne({email});
        if(existuser) return res.statues(400).json({message:"user already exists"});
        const hashpwd= await bcrypt.hash(password,12);
        const user =await User.create({
            email,
            password:hashpwd,
        });
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET);
        res.status(201).json({token,user});
    }catch(err){
        res.status(500).json({ message: "Signup failed", error: err.message });
    }
}

exports.login=async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(!user || !user.password) return res.status(400).json({ msg: "Invalid credentials" });
        const isMatch = await bcrypt.compare(password,user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({token,user});
    }catch(err){
        res.status(500).json({ message: "login failed", error: err.message });
    }
}

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60000); // 10 min
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();
    await sendOTP(email, otp);
    res.json({ msg: "OTP sent to email" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Failed to generate OTP", error: err.message });
  }
};


// exports.verifyOTP = async (req, res) => {
//     try{
//       const {email,otp,newPassword } = req.body;
//       const user = await User.findOne({ email });
//       console.log("User OTP:", user.otp);
//         console.log("Provided OTP:", otp);
//         console.log("OTP Expiry:", user.otpExpiresAt);
//       if (!user || user.otp !== otp || new Date() > user.otpExpiresAt){
//         if(new Date()>user.otpExpiresAt){
//             user.otp=null;
//             user.otpExpiresAt=null;
//             await user.save();
//         }
//         return res.status(400).json({ msg: "Invalid or expired OTP" });
//       }
//       user.password = await bcrypt.hash(newPassword, 12);
//       user.otp=null;
//       user.otpExpiresAt=null;
//       await user.save();
//       res.json({msg:"Password updated successfully"});
//     }catch(err){
//       res.status(500).json({msg:"Failed to verify OTP",error: err.message });
//     }
// };

exports.verifyOTP = async (req, res) => {
    try {
      const { email,otp,password } = req.body;
      console.log("Request:", { email, otp, password });
  
      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found");
        return res.status(400).json({ msg: "Invalid or expired OTP" });
      }
  
      console.log("Stored OTP:", user.otp);
      console.log("Provided OTP:", otp);
      console.log("Current Time:", new Date());
      console.log("OTP Expiry Time:", user.otpExpiresAt);
  
      if (user.otp !== otp || new Date() > user.otpExpiresAt) {
        console.log("OTP invalid or expired");
        if (new Date() > user.otpExpiresAt) {
          user.otp = null;
          user.otpExpiresAt = null;
          await user.save();
        }
        return res.status(400).json({ msg: "Invalid or expired OTP" });
      }
  
      if (!password || user.password===password) {
        console.log("Missing new password");
        return res.status(400).json({ msg: "password not entered or entered the same password" });
      }
  
      user.password = await bcrypt.hash(password, 12);
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
  
      res.json({ msg: "Password updated successfully" });
    } catch (err) {
      console.error("Error verifying OTP:", err);
      res.status(500).json({ msg: "Failed to verify OTP", error: err.message });
    }
  };

exports.googleSignIn = async (req, res) => {
    res.status(501).json({ msg: "Google Sign-in not implemented yet" });
};
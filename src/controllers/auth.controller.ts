import { Request,Response } from "express";
import { User } from "../models/user.model";
import bcrypt from 'bcrypt';
import { generateToken } from "../Token/token";
import validator from "validator";
export const registerUser=async (req:Request, res:Response) => {
    try {
    const { fullName, email, password ,role} = req.body;
    let isVaildPassword=validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
    let passwordMessages=" minLength: 8, minLowercase: 1, minUppercase: 1 ,minNumbers: 1 ,minSymbols: 1"
    if (!fullName || !email || !password ||!role){
        return res.status(400).json({ message: "all data required" });
    }
    if( (role!='Member' && role!='Trainer')){
        return res.status(400).json({ message: "invalid role" });
    }
    if(!validator.isEmail(email)){
        return res.status(400).json({ message: "invalid email" });
    }
    if ( !isVaildPassword) {
        return res.status(400).json({ message: `must be strong password \n ${passwordMessages}` });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
    fullName,
    email:email.toLowerCase(),
    hashedPassword,
    role
    });

    res.status(201).json(
    { 
        message: "User registered successfully" ,
        fullName:newUser.fullName,
        email:newUser.email,
        role:newUser.role
    });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong " });
    }
};


export const login =async (req:Request, res:Response) => {
    try {
    const { email, password } = req.body;
   

    const user = await User.findOne({ email:email.toLowerCase() });
    if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
    return res.status(401).json({ message: "Invalid password" });
    }
    const token = generateToken(user)
    res.status(200).json({ token });
    
    } catch (err) {
    res.status(500).json({ message: "Something went wrong " });
    }
   }
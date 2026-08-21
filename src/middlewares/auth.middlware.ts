const jwt = require("jsonwebtoken");
import { Request,Response } from "express";
import { NextFunction } from "express";
export function authMiddleware(req:Request, res:Response, next:NextFunction) {
    const authHeader = req.headers.authorization; 
    if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
    }
   
    const token = authHeader.split(" ")[1];
   
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded; 
    next(); 
    } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
    }
   }
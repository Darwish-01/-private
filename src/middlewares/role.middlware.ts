const jwt = require("jsonwebtoken");
import { Request,Response } from "express";
import { NextFunction } from "express";
export function authorize(role:any) {
    return (req:Request, res:Response, next:NextFunction) => {
    if (req.user!.role !== role) {
    return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
    };
}
"use strict";

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

import { UserAttributes, UserInstance } from "../model/userModel";
import { UserPayload } from "../interface/user.dto";
import axios from "axios";

interface JwtExpPayload {
  expiresIn: string;
  exp: number;
  id: string;
}
declare global {
  namespace Express {
    interface Request {
      user?: UserAttributes;
    }
  }
}

//interface loguser extends Request, user {}

const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string = "";

  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).send({
      status: 401,
      message: "Not authorized, you have no access token",
    });
    return;
    //throw new Error('Not authorized, you have no access token')
  }
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const { id } = jwt.verify(
        token,
        process.env.APP_SECRET || ""
      ) as JwtExpPayload;
      // console.log(id)

      const user = await UserInstance.findByPk(id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        throw new Error(`not Authorized`);
      }
      //console.log()
      //req.user = user
      req.user = user;

      next();
    } catch (error) {
      //   console.log(error)
      res.status(401).send({ error, message: "you are not a valid user" });

      return;
      //   throw new Error(`${error}`)
    }
  }
};
const tutor = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.userType === "Tutor") {
    next();
  } else {
    res.status(401);
    res.send({ message: "Not authorized; you are not an tutor" });
    return;
  }
};
const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transRef = req.params.reference;
    const response = await axios.get(
      `${process.env.PAYSTACK_DOMAIN}/transaction/verify/${transRef}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      }
    );

    next();

    // console.log(response.data.data.status);
  } catch (error: any) {
    console.log(error.response.data.message);
    res.status(400).send({ message: error.response.data.message });
  }
};

const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    res.send({ message: "Not authorized; you are not an admin" });
  }
  console.log(req.user);
};
// const authorized = async (req: Request, res: Response, next: NextFunction) => {
//   // if(req.user && req.user.id)
// }

export { protect, admin, tutor, verifyPayment };

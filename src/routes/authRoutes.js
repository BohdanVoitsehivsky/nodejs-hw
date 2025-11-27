import { Router } from "express";
import { celebrate  } from "celebrate";
import { loginUser, logoutUser, refreshUserSession, registerUser } from "../controllers/authController.js";
import { loginUserSchema, registerUserSchema } from "../validations/authValidation.js";


   const authRoutes = Router();
   authRoutes.post("/auth/register", celebrate(registerUserSchema), registerUser);
   authRoutes.post("/auth/login",celebrate(loginUserSchema), loginUser);
   authRoutes.post("/auth/logout", logoutUser );
  //  при рефреші немає валідації
   authRoutes.post("/auth/refresh", refreshUserSession);
export default authRoutes;

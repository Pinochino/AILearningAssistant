import { Router } from "express";
import userController from "~/controllers/UserController";
import authenticationMiddleware from "~/middlewares/auth/authenticationMiddleware";
import authorizationMiddleware from "~/middlewares/auth/authorizationMiddleware";

const userRouter = Router();
userRouter.get('/list', authenticationMiddleware, authorizationMiddleware,  userController.getAllUsers)

export default userRouter;

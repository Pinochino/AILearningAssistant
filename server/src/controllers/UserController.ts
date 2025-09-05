import { Request, Response } from "express";
import userService from "~/services/userService";

const userController = {

  getAllUsers: async (req: Request, res: Response) => {
    try {
      const { limit, order, search, skip, sortBy } = req.query
      const users = await userService.getUsers(req.query);
      res.status(200).json({
        msg: `Get users successfully`,
        data: users,
      })
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message })
      return;
    }
  }
}

export default userController;
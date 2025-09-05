import { User } from "~/models/User";
import { QueryInterface } from "~/types/QueryInterface";

const userService = {

  getUsers: async ({ limit, order, search, skip, sortBy }: QueryInterface) => {
    const users = await User.find()
      .sort(sortBy)
      .limit(limit ? limit : 0)
      .skip(skip ? skip : 0)
      .exec()
    return users;
  },

  getUser: async (userId: string) => {
    const user = await User.findById(userId);
    return user;
  },



}

export default userService;
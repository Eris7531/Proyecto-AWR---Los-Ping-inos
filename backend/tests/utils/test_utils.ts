import User from "../../src/models/users";

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

export default {usersInDb };


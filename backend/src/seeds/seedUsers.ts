import User from "../models/users";
import bcrypt from "bcrypt"; 

const seedUsers = async (): Promise<void> => {
  
  const passwordHash = await bcrypt.hash("password123", 10);

  
  const initialUsers = [
    {
      username: "JugadorPrueba",
      passwordHash: passwordHash
    }
  ];

  for (const userData of initialUsers) {
    
    const exists = await User.findOne({ username: userData.username });
    if (!exists) {
      await User.create(userData);
    }
  }

  console.log("Users seeded successfully.");
};

export default seedUsers;
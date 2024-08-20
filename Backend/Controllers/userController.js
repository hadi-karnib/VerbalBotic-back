import bcrypt from "bcryptjs";
import User from "../Models/User.js";
import { generateToken } from "../Middleware/authToken.js";

export const signup = async (req, res) => {
  const { name, age, illness, UserType, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      age,
      illness,
      UserType,
      email,
      password: hashedPassword,
      children: [],
      chat: { messages: [] },
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

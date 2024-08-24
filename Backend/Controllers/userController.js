import bcrypt from "bcryptjs";
import User from "../Models/User.js";
import { generateToken } from "../Middleware/authToken.js";

export const signup = async (req, res) => {
  const { name, age, illness, UserType, email, password, phoneNumber } =
    req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex =
    /^(?:\+961|961|0)?(81\d{6}|71\d{6}|76\d{6}|79\d{6}|3\d{6})$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!phoneRegex.test(phoneNumber)) {
    return res
      .status(400)
      .json({ message: "Invalid Lebanese phone number format" });
  }

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
      phoneNumber,
      children: [],
      chat: { messages: [] },
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({ success: true, token });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

export const getUserChats = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("chat.messages");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.chat.messages);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

export const addBio = async (req, res) => {
  const { hobbies, work, illness, bio } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.hobbies = hobbies || user.hobbies;
    user.work = work || user.work;
    user.illness = illness || user.illness;
    user.bio = bio || user.bio;

    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

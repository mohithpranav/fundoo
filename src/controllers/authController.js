import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import user from "../models/user.Model.js";
import asyncHandler from "../utils/async-handler.js";

const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await user.findOne({ email: email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await user.create({
    username,
    email,
    password: hashedPassword,
  });
  res.status(201).json({ message: "User registered successfully", newUser });
});

const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await user.findOne({ email: email });

  if (!existingUser) {
    return res.status(400).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      email: existingUser.email,
      id: existingUser._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.status(200).json({ token });
});

const userProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userProfile = await user.findById(userId).select("-password");
  res.status(200).json(userProfile);
});

export { signup, signin, userProfile };

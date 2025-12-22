import jwt from "jsonwebtoken";
import user from "../models/user.js";
import bcrypt from "bcrypt";

const signup = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await user.findOne({ email: email });

    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser._id,
      },
      process.env.JWT_SECRET
    );
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const UserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userProfile = await user.findById(userId).select("-password");
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { signup, signin, UserProfile };

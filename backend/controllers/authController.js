import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SUPPORTED_LANGUAGES = new Set(["en", "hi", "te", "kn"]);

export const registerUser = async (req, res) => {
  const { name, email, password, preferredLanguage } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }


    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      preferredLanguage: SUPPORTED_LANGUAGES.has(preferredLanguage) ? preferredLanguage : "en",
    });

    res.json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const loginUser = async (req, res) => {

  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email preferredLanguage");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updatePreferredLanguage = async (req, res) => {
  try {
    const { preferredLanguage } = req.body;

    if (!SUPPORTED_LANGUAGES.has(preferredLanguage)) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferredLanguage },
      { new: true, runValidators: true, select: "name email preferredLanguage" }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Preferred language updated",
      user,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

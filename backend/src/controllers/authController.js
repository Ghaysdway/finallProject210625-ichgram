import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { email, phone, username, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ message: "Пользователь с таким email уже существует" });
      }
      if (existingUser.username === username) {
        return res
          .status(400)
          .json({ message: "Пользователь с таким именем уже существует" });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({
          message: "Пользователь с таким номером телефона уже существует",
        });
      }
    }

    const newUser = new User({ username, email, password, phone });
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "23h",
    });

    res.status(201).json({
      message: "Регистрация успешна",
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        message: `Пользователь с таким ${
          field === "email"
            ? "email"
            : field === "username"
            ? "именем"
            : "номером телефона"
        } уже существует`,
      });
    } else {
      res.status(500).json({ message: "Ошибка при регистрации пользователя" });
    }
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email);

    const user = await User.findOne({ email }).select("+password");
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return res.status(404).json({
        message: "Пользователь с таким email не найден",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Неверный пароль",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "23h",
    });

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
      fullName: user.fullName,
      website: user.website,
    };

    res.status(200).json({
      message: "Вход выполнен успешно",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Произошла ошибка при входе в систему",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getMe:", error);
    res
      .status(500)
      .json({ message: "Ошибка сервера при получении данных пользователя" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email и новый пароль обязательны." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Пароль успешно сброшен." });
  } catch (error) {
    console.error("Ошибка при сбросе пароля:", error);
    res.status(500).json({ message: "Ошибка сервера при сбросе пароля." });
  }
};

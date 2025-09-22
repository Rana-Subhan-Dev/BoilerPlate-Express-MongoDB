import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import {
  checkUserByEmailData,
  creatUserData,
  updateUserPasswordData,
} from '../services/user.js';
import { sendMail } from '../utils/sendEmail.js';
import excludeitems from '../utils/exclude.js';

/* eslint-disable no-undef */
const JWTPHRASE = process.env.JWTPHRASE;

// In-memory Map (acts like Redis)
const signupCache = new Map();

// Single API for signup (cache + register)
export const registerUser = async (req, res) => {
  try {
    const { sessionId, data, finalize } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "SessionId is required" });
    }

    if (!finalize) {
      // Cache step data
      let existing = signupCache.get(sessionId) || {};
      const merged = { ...existing, ...data };
      signupCache.set(sessionId, merged);

      return res.json({ message: "Step data cached successfully" });
    }

    // Final step → register user
    const userData = signupCache.get(sessionId);
    if (!userData) {
      return res.status(400).json({ message: "No signup data found for this session" });
    }

    if (!userData.email || !userData.password) {
      return res.status(400).json({ message: "Missing account details" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Save user in DB
    const newUser = new User({
      email: userData.email,
      password: hashedPassword,
      companyName: userData.companyName,
      contactPerson: userData.contactPerson,
      gstNumber: userData.gstNumber,
      panNumber: userData.panNumber,
      billingAddress: userData.billingAddress,
      billingCity: userData.billingCity,
      billingZip: userData.billingZip,
      billingCountry: userData.billingCountry,
      billingPhone: userData.billingPhone,
      shippingAddress: userData.shippingAddress,
      shippingCity: userData.shippingCity,
      shippingZip: userData.shippingZip,
      shippingCountry: userData.shippingCountry,
      shippingPhone: userData.shippingPhone,
    });

    await newUser.save();

    // Clear cached data
    signupCache.delete(sessionId);

    return res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await checkUserByEmailData(email);
    if (!user) {
      return res.status(404).json({
        res: "error",
        msg: `User does not exist with email: ${email}`
      });
    }

    // 2. Validate password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        res: "error",
        msg: "Invalid credentials"
      });
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,   // use env variable
      { expiresIn: "1d" }       // optional expiration
    );

    // 4. Remove sensitive fields before sending
    const safeUser = excludeitems(user.toObject(), "password", "updatedAt", "__v");

    return res.status(200).json({
      res: "success",
      msg: "User logged in successfully",
      data: safeUser,
      token,
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({
      res: "error",
      msg: "An error occurred during login"
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email, password, newpassword } = req.body;
    const checkuser = await checkUserByEmailData(email);
    if (!checkuser) {
      return res
        .status(402)
        .json({ res: 'success', msg: `User is not exists with ${email}` });
    }
    const validpassword = await bcrypt.compare(password, checkuser.password);
    if (validpassword) {
      const salt = await bcrypt.genSalt(10);
      const passwordhash = await bcrypt.hash(newpassword, salt);
      const updatepass = await updateUserPasswordData(
        checkuser._id,
        passwordhash
      );
      if (updatepass) {
        res.status(200).json({
          res: 'success',
          msg: 'Password is changed',
        });
      } else {
        res
          .status(500)
          .json({ res: 'error', msg: 'Error accourd in changing password' });
      }
    } else {
      res
        .status(500)
        .json({ res: 'error', msg: 'Error accourd in changing password' });
    }
  } catch (error) {
    console.log('error-------------------------->', error);
    res.status(500).json({ res: 'error', msg: 'Error accourd' });
  }
};

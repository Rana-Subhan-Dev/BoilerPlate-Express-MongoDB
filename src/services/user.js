import User from "../models/User.js";

export const checkUserByEmailData = async (email) => {
  try {
    return await User.findOne({
      email: email,
    });
  } catch (error) {
    console.log('error--------------------->', error);
    return false;
  }
};

export const creatUserData = async (data) => {
  try {
    const result = new User(data);

    return await result.save();
  } catch (error) {
    console.log('error--------------------->', error);
    return false;
  }
};

export const updateUserPasswordData = async (id, password) => {
  try {
    return await User.findByIdAndUpdate(id, { password: password });
  } catch (error) {
    console.log('error--------------------->', error);
    return false;
  }
};

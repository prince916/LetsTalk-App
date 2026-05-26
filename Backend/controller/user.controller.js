import User from "../models/user.model.js";

export const signup = (req, res) => {
  try {
    const { name, email, password, confirnpassword } = req.body;
  if (password != confirnpassword) {
    return res.status(400).json({ message: "Password do not match" });
  }
  const user = User.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "Email alreadt exists" });
  }
  const newUser = new User({
    name,
    email,
    password,
  });
  newUser
    .save()
    .then(() =>
      res.status(201).json({ message: "User registered successfully" }),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
